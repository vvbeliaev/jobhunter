package parser

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/gotd/td/telegram"
	"github.com/gotd/td/telegram/auth"
	"github.com/gotd/td/tg"
	"go.uber.org/zap"
)

// Config holds Telegram API credentials and session settings.
type Config struct {
	APIID       int
	APIHash     string
	Phone       string
	SessionPath string // Path to session.json file
}

func LoadConfigFromEnv() Config {
	apiID, _ := strconv.Atoi(os.Getenv("TG_API_ID"))
	return Config{
		APIID:       apiID,
		APIHash:     os.Getenv("TG_API_HASH"),
		Phone:       os.Getenv("TG_PHONE"),
		SessionPath: getEnvOrDefault("TG_SESSION_PATH", "session.json"),
	}
}

func getEnvOrDefault(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

type Client struct {
	config     Config
	client     *telegram.Client
	logger     *zap.Logger
	dispatcher tg.UpdateDispatcher
}

func NewClient(cfg Config, logger *zap.Logger) *Client {
	if logger == nil {
		logger, _ = zap.NewDevelopment()
	}

	dispatcher := tg.NewUpdateDispatcher()

	client := telegram.NewClient(cfg.APIID, cfg.APIHash, telegram.Options{
		Logger:         logger,
		SessionStorage: &telegram.FileSessionStorage{Path: cfg.SessionPath},
		UpdateHandler:  dispatcher,
		Device: telegram.DeviceConfig{
			DeviceModel:    "Desktop",
			SystemVersion:  "Windows 10",
			AppVersion:     "1.0.0",
			SystemLangCode: "en",
			LangCode:       "en",
		},
	})

	return &Client{
		config:     cfg,
		client:     client,
		logger:     logger,
		dispatcher: dispatcher,
	}
}

type terminalAuth struct {
	phone string
}

func (t terminalAuth) Phone(_ context.Context) (string, error) {
	if t.phone != "" {
		return t.phone, nil
	}
	fmt.Print("Enter phone number: ")
	reader := bufio.NewReader(os.Stdin)
	phone, _ := reader.ReadString('\n')
	return strings.TrimSpace(phone), nil
}

func (t terminalAuth) Password(_ context.Context) (string, error) {
	fmt.Print("Enter 2FA password: ")
	reader := bufio.NewReader(os.Stdin)
	password, _ := reader.ReadString('\n')
	return strings.TrimSpace(password), nil
}

func (t terminalAuth) Code(_ context.Context, _ *tg.AuthSentCode) (string, error) {
	fmt.Print("Enter auth code: ")
	reader := bufio.NewReader(os.Stdin)
	code, _ := reader.ReadString('\n')
	return strings.TrimSpace(code), nil
}

func (t terminalAuth) AcceptTermsOfService(_ context.Context, tos tg.HelpTermsOfService) error {
	return nil
}

func (t terminalAuth) SignUp(_ context.Context) (auth.UserInfo, error) {
	return auth.UserInfo{}, fmt.Errorf("sign up not supported")
}

func (c *Client) Login(ctx context.Context) error {
	return c.client.Run(ctx, func(ctx context.Context) error {
		flow := auth.NewFlow(terminalAuth{phone: c.config.Phone}, auth.SendCodeOptions{})

		if err := c.client.Auth().IfNecessary(ctx, flow); err != nil {
			return fmt.Errorf("auth failed: %w", err)
		}

		self, err := c.client.Self(ctx)
		if err != nil {
			return fmt.Errorf("failed to get self: %w", err)
		}

		c.logger.Info("Successfully logged in",
			zap.String("username", self.Username),
			zap.Int64("user_id", self.ID),
			zap.String("first_name", self.FirstName),
		)

		fmt.Printf("\nLogged in as: %s (@%s)\n", self.FirstName, self.Username)
		fmt.Printf("Session saved to: %s\n", c.config.SessionPath)

		return nil
	})
}

func (c *Client) OnNewMessage(handler func(ctx context.Context, msg *tg.Message, peerID int64) error) {
	// Channels and Supergroups
	c.dispatcher.OnNewChannelMessage(func(ctx context.Context, e tg.Entities, update *tg.UpdateNewChannelMessage) error {
		msg, ok := update.Message.(*tg.Message)
		if !ok || msg.Out {
			return nil
		}

		peer, ok := msg.PeerID.(*tg.PeerChannel)
		if !ok {
			return nil
		}

		return handler(ctx, msg, peer.ChannelID)
	})

	// Legacy Groups and Private Chats
	c.dispatcher.OnNewMessage(func(ctx context.Context, e tg.Entities, update *tg.UpdateNewMessage) error {
		msg, ok := update.Message.(*tg.Message)
		if !ok || msg.Out {
			return nil
		}

		var peerID int64
		switch p := msg.PeerID.(type) {
		case *tg.PeerChat:
			peerID = p.ChatID
		case *tg.PeerUser:
			peerID = p.UserID
			if user, ok := e.Users[p.UserID]; ok {
				if !user.Bot {
					c.logger.Debug("Ignoring private message from human user", zap.Int64("user_id", p.UserID))
					return nil
				}
			}
		default:
			return nil
		}

		return handler(ctx, msg, peerID)
	})
}

// SendMessageToSelf sends a formatted message to your "Saved Messages".
func (c *Client) SendMessageToSelf(ctx context.Context, text string) error {
	randomID, err := c.client.RandInt64()
	if err != nil {
		return fmt.Errorf("failed to generate random ID: %w", err)
	}
	_, err = c.client.API().MessagesSendMessage(ctx, &tg.MessagesSendMessageRequest{
		Peer:    &tg.InputPeerSelf{},
		Message: text,
		RandomID: randomID,
	})
	return err	
}

func (c *Client) Start(ctx context.Context) error {
	return c.client.Run(ctx, func(ctx context.Context) error {
		
		status, err := c.client.Auth().Status(ctx)
		if err != nil {
			return fmt.Errorf("failed to get auth status: %w", err)
		}

		if !status.Authorized {
			return fmt.Errorf("not authorized - run with --login flag first")
		}

		self, err := c.client.Self(ctx)
		if err != nil {
			return fmt.Errorf("failed to get self: %w", err)
		}

		c.logger.Info("Telegram client started",
			zap.String("username", self.Username),
			zap.Int64("user_id", self.ID),
		)

		<-ctx.Done()
		return ctx.Err()
	})
}

func (c *Client) API() *tg.Client {
	return c.client.API()
}

func (c *Client) Logger() *zap.Logger {
	return c.logger
}
