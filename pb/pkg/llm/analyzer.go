package llm

import (
	"context"
	"encoding/json"
	"os"

	openai "github.com/sashabaranov/go-openai"
	"github.com/sashabaranov/go-openai/jsonschema"
)

// JobParsedData represents the structured output from LLM analysis.
type JobParsedData struct {
	IsVacancy   bool     `json:"isVacancy"`   // False if spam/advertisement/not a job posting
	Title       string   `json:"title"`       // Job title
	Company     string   `json:"company"`     // Company name if mentioned
	SalaryMin   int      `json:"salaryMin"`   // Minimum salary (0 if not specified)
	SalaryMax   int      `json:"salaryMax"`   // Maximum salary (0 if not specified)
	Currency    string   `json:"currency"`    // Currency code (USD, EUR, RUB, etc.)
	Skills      []string `json:"skills"`      // Required skills/technologies
	IsRemote    bool     `json:"isRemote"`    // Whether remote work is available
	Grade       string   `json:"grade"`       // Junior, Middle, Senior, Lead, etc.
	Location    string   `json:"location"`    // Office location if mentioned
	Description string   `json:"description"` // Brief job description
}

func (j JobParsedData) Schema() *jsonschema.Definition {
	schema, err := jsonschema.GenerateSchemaForType(j)
	if err != nil {
		panic(err)
	}
	return schema
}

// Analyzer is the LLM client wrapper for job vacancy analysis.
type Analyzer struct {
	client *openai.Client
	model  string
}

// NewAnalyzer creates a new LLM analyzer with the given credentials.
// If apiKey or baseURL are empty, it reads from LITELLM_API_KEY and LITELLM_URL environment variables.
func NewAnalyzer(apiKey, baseURL string) *Analyzer {
	if apiKey == "" {
		apiKey = os.Getenv("OPENAI_API_KEY")
	}
	if baseURL == "" {
		baseURL = os.Getenv("OPENAI_BASE_URL")
	}

	config := openai.DefaultConfig(apiKey)
	if baseURL != "" {
		config.BaseURL = baseURL
	}

	return &Analyzer{
		client: openai.NewClientWithConfig(config),
		model:  "gpt-5.2",
	}
}

// SystemPrompt defines the LLM's behavior for parsing job vacancies.
const SystemPrompt = `You are a job vacancy parser. Your task is to analyze text messages and extract structured data about job postings.

IMPORTANT RULES:
1. If the text is NOT a job vacancy (e.g., advertisement, news, chat message), set isVacancy to false and leave other fields empty/default.
2. If it IS a vacancy, set isVacancy to true and EXTRACT the job title (e.g., "Golang Developer", "Product Manager").
3. If the title is not explicitly stated, infer it from the context or use the most prominent role mentioned. NEVER leave title empty if isVacancy is true.
4. Extract salary information if present. Convert to numbers only, no currency symbols.
5. Identify the currency from context (look for $, €, ₽, USD, EUR, RUB, etc.)
6. Extract required skills/technologies as a list of short keywords.
7. Determine job grade from context clues (Junior/Middle/Senior/Lead/Principal).
8. Set isRemote to true if remote work, WFH, or distributed team is mentioned.

Always respond with valid JSON matching the schema exactly.`

const OfferSystemPrompt = `
ROLE:
You are Vladimir Beliaev, a product-minded Full-stack Engineer. You are writing a cold DM on Telegram to a Recruiter or Founder.

INPUTS:
- Your CV (JSON)
- Job Description (Text)

OBJECTIVE:
Write a concise, high-impact message that proves value instantly. No fluff.

CRITICAL RULES:
1. **Language Detection (STRICT):**
   - Check the Job Description language.
   - **IF English:** Write fully in English. Greeting: "Hi [Name/Team], I'm Vladimir." CTA: "Open to chat?"
   - **IF Russian:** Write fully in Russian. Greeting: "Привет, [Имя/Команда], это Владимир." CTA: "Буду рад пообщаться."
   - **NEVER** mix languages (e.g., Russian text with English CTA).

2. **The "No-Repeat" Rule:**
   - Don't say "I see you are looking for X" (they know what they are looking for).
   - Instead, state immediately that you **do** X.
   - *Bad:* "I saw you need a SvelteKit dev. I have experience with it."
   - *Good:* "I specialize in building high-performance SPAs with SvelteKit and TypeScript."

3. **Smart Experience Highlighting:**
   - Do not mention specific years (e.g., "3 years experience") unless it's >5.
   - Instead, use action verbs: "I ship", "I architect", "I maintain".
   - Connect the requested stack directly to your portfolio logic (e.g., "I use this stack to build [mention a project type from CV]").

4. **Tone:**
   - Professional but conversational. Telegram style.
   - Low ego, high competence.

STRUCTURE:
1. **Greeting:** Standardized based on language.
2. **The Match:** One sentence merging their tech stack need with your daily work.
3. **The Proof:** Briefly mention you build full-stack products end-to-end (mentioning relevant tools like Docker/FastAPI only if relevant to the JD, otherwise focus on Frontend).
4. **Closing:**
   - Link: https://vvbeliaev.cogisoft.dev
   - CTA: Short question.

OUTPUT FORMAT:
Return ONLY the raw message text.
`;

// AnalyzeVacancy sends the message text to LLM and returns structured job data.
func (a *Analyzer) AnalyzeVacancy(ctx context.Context, text string) (JobParsedData, error) {
	resp, err := a.client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: a.model,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: SystemPrompt,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: text,
				},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONSchema,
				JSONSchema: &openai.ChatCompletionResponseFormatJSONSchema{
					Name:   "job_parser",
					Schema: JobParsedData{}.Schema(),
					Strict: true,
				},
			},
		},
	)

	if err != nil {
		return JobParsedData{}, err
	}

	var result JobParsedData
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result)
	return result, err
}

// GenerateOffer creates a personalized first touch message.
func (a *Analyzer) GenerateOffer(ctx context.Context, cv string, jobDescription string) (string, error) {
	resp, err := a.client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: a.model,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: OfferSystemPrompt,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "CV: " + cv + "\n\nJob Description: " + jobDescription,
				},
			},
		},
	)

	if err != nil {
		return "", err
	}

	if len(resp.Choices) == 0 {
		return "", nil
	}

	return resp.Choices[0].Message.Content, nil
}
