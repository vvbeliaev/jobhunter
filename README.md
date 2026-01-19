<!-- LOGO PLACEHOLDER -->
<p align="center">
  <img src="https://via.placeholder.com/150?text=JobHunter" alt="JobHunter Logo" width="120" height="120"/>
</p>

<h1 align="center">🕵️‍♂️ JobHunter</h1>

<p align="center">
  The <b>"Bleeding Edge"</b> Automated Job Search: Svelte 5 + PocketBase (Go) + Telegram + LLM.
  <br/>
  <i>Infiltrate Telegram channels, extract vacancies with AI, and land your next job.</i>
</p>

<!-- BADGES -->
<p align="center">
  <a href="https://cogisoft.dev"><img src="https://img.shields.io/badge/maintained%20by-Cogisoft.dev-blueviolet?style=flat-square&logo=dev.to" alt="Maintained by Cogisoft"></a>
  <img src="https://img.shields.io/badge/Svelte-5_Runes-orange?style=flat-square&logo=svelte" alt="Svelte 5">
  <img src="https://img.shields.io/badge/Backend-Go_%2B_PocketBase-00ADD8?style=flat-square&logo=go" alt="Go Backend">
  <img src="https://img.shields.io/badge/AI-LLM_Extraction-green?style=flat-square" alt="LLM Powered">
</p>

<p align="center">
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-expert-services--consulting">💼 Hire the Experts</a>
</p>

---

## 🧐 What is JobHunter?

**JobHunter** is an automated pipeline designed to eliminate the manual grind of searching for jobs in Telegram channels and chats. It listens to your account, filters noise, and uses AI to turn messy chat messages into structured job opportunities.

- **Hexagonal Architecture**: Built with a clean, decoupled backend structure (Core, Usecases, Adapters) ensuring long-term maintainability and easy testing.
- **AI-Powered Extraction**: Uses LLMs (GPT) to parse Telegram messages into structured data: title, company, salary, skills, and grade.
- **Smart Response**: Generates personalized "first touch" messages based on your CV and the specific vacancy description.
- **Single Binary Deploy**: Compiles into one executable file containing the UI, Database (SQLite), and the Telegram Userbot.

## ✨ Features

- 📱 **Telegram Collector:** A `gotd`-based userbot that listens to all incoming messages in your account.
- ⚡️ **Fast Filtering:** Keyword-based filtering in Go before hitting the LLM to save tokens and improve speed.
- 🧠 **LLM Job Module:** Extraction and personalized offer generation using state-of-the-art OpenAI models.
- 🔥 **Frontend:** [Svelte 5](https://svelte.dev) (Runes) + Tailwind 4 + DaisyUI 5 for a modern, reactive dashboard.
- 🐹 **Extended PocketBase:** Uses PocketBase as a Go framework, allowing for complex business logic in Go.
- 🛡️ **Type Safety:** End-to-end typing with `pocketbase-typegen`.
- 🐳 **Production Ready:** Optimized Dockerfile included for easy deployment.

---

## 💼 Expert Services & Consulting

This project is maintained by **[Cogisoft](https://cogisoft.dev)**. We specialize in building high-performance automation tools, custom bots, and modern web applications using this exact stack.

**Need a custom automation or a similar tool?**
We help Indie Hackers and Businesses with:

- 🚀 **MVP Development:** From concept to a production-ready tool in weeks.
- 🤖 **AI Integrations:** LLM-based extraction, classification, and generation pipelines.
- ⚙️ **Custom Go Backend:** High-performance services beyond standard CRUD.
- ☁️ **Managed Hosting:** Deployment and maintenance of your specialized bots and apps.

👉 **[Get a quote from Cogisoft](https://cogisoft.dev/contact)**

---

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```env
TG_API_ID=your_id
TG_API_HASH=your_hash
TG_PHONE=+1234567890
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1 # Optional
```

### 2. Backend Setup & Auth

Ensure you have [Go 1.23+](https://go.dev) installed.

1. **Install dependencies:**
   ```bash
   cd pb
   go mod download
   ```

2. **Telegram Authorization:**
   Run the login command once to create `session.json`:
   ```bash
   go run . tg-login
   ```

3. **Start Backend:**
   ```bash
   go run . serve
   ```
   _Admin UI: `http://127.0.0.1:8090/_/`_

### 3. Frontend Development

Open a new terminal in the root directory:

```bash
pnpm install
pnpm dev
```
_App URL: `http://localhost:5173`_

## 🛠 Project Structure

| Path              | Description                                                    |
| :---------------- | :------------------------------------------------------------- |
| `pb/`             | **Backend Core.** Hexagonal architecture, TG bot, and PB logic. |
| `src/routes/`     | **Frontend Pages.** SvelteKit routing (SPA mode).              |
| `src/lib/apps/`   | **Domain Logic.** Job feed and dashboard features.              |
| `src/lib/shared/` | **UI Kit.** Reusable components and PB client.                 |

## 📦 Building for Production

Experience the power of the **Single Binary Architecture**:

1.  **Build Frontend:**
    ```bash
    pnpm build
    ```
    _(Compiles Svelte into static files inside `pb/pb_public`)_

2.  **Compile Go Binary:**
    ```bash
    cd pb
    go build -o ../jobhunter
    ```

3.  **Deploy:**
    Upload `jobhunter` to your VPS and run:
    ```bash
    ./jobhunter serve
    ```

## 📜 License

MIT © [Vladimir Beliaev](https://vvbeliaev.cogisoft.dev) from [Cogito Software](https://cogisoft.dev).
Free to use for personal and commercial projects.
