<!-- LOGO PLACEHOLDER - Replace with your logo or delete -->
<p align="center">
  <img src="https://via.placeholder.com/150?text=SVPB" alt="SVPB Template Logo" width="120" height="120"/>
</p>

<h1 align="center">⚡️ svpb-tmpl</h1>

<p align="center">
  The <b>"Bleeding Edge"</b> Fullstack Boilerplate: Svelte 5 + PocketBase (Go) + Tailwind 4.
  <br/>
  <i>Built for Indie Hackers who want to ship fast and stay independent.</i>
</p>

<!-- BADGES -->
<p align="center">
  <a href="https://cogisoft.dev"><img src="https://img.shields.io/badge/maintained%20by-Cogisoft.dev-blueviolet?style=flat-square&logo=dev.to" alt="Maintained by Cogisoft"></a>
  <img src="https://img.shields.io/badge/Svelte-5_Runes-orange?style=flat-square&logo=svelte" alt="Svelte 5">
  <img src="https://img.shields.io/badge/Backend-Go_%2B_PocketBase-00ADD8?style=flat-square&logo=go" alt="Go Backend">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

<p align="center">
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-expert-services--consulting">💼 Hire the Experts</a>
</p>

---

## 🧐 Why this stack?

**svpb-tmpl** is opinionated. It rejects the complexity of modern "Enterprisey" frameworks in favor of raw speed and portability.

- **Single Binary Deploy:** The entire app (Frontend + Backend) compiles into one executable file. No Docker hell, no complex CI/CD. Copy to server -> Run.
- **Go Performance:** Unlike standard PocketBase, this template uses PB as a **Go framework**. Write your complex business logic in Go, not JavaScript hooks.
- **Next-Gen UI:** Leverages **Svelte 5 Runes** (`$state`, `$derived`) and **Tailwind 4** for a developer experience that feels like magic.

## ✨ Features

- 🔥 **Frontend:** [Svelte 5](https://svelte.dev) (SPA mode) for maximum reactivity.
- 🐹 **Backend:** [PocketBase](https://pocketbase.io) extended with **Go**.
- 🎨 **Styling:** [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com).
- 🛡️ **Type Safety:** End-to-end typing with `pocketbase-typegen`.
- 📱 **PWA Ready:** Offline support & installable via `vite-pwa`.
- 📈 **Analytics:** Pre-configured [PostHog](https://posthog.com) integration.
- 🐳 **Production Ready:** Optimized Dockerfile included (or just run the binary!).

---

## 💼 Expert Services & Consulting

This template is maintained by me at **[Cogisoft](https://cogisoft.dev)**. I specialize in building high-performance web applications using this exact stack.

**Need help building your product?**
I help Indie Hackers and Startups with:

- 🚀 **MVP Development:** We build your product from 0 to 1 using this template.
- ⚙️ **Custom Go Logic:** Complex backend features that standard PocketBase can't handle.
- ☁️ **Managed Hosting:** Don't want to manage servers? We host and maintain your instances.

👉 **[Get a quote from Cogisoft](https://cogisoft.dev/contact)**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/vvbeliaev/svpb-tmpl.git
cd svpb-tmpl
pnpm install
```

### 2. Backend Setup (Go)

Ensure you have [Go 1.23+](https://go.dev) installed.

```bash
cd pb
go run main.go serve
```

_Admin UI: `http://127.0.0.1:8090/_/`\_

### 3. Frontend Development

Open a new terminal in the root directory:

```bash
pnpm dev
```

_App URL: `http://localhost:5173`_

## 🛠 Project Structure

An organized monorepo structure for clarity:

| Path              | Description                                                    |
| :---------------- | :------------------------------------------------------------- |
| `pb/`             | **Backend Core.** Custom Go migrations, hooks, and API routes. |
| `src/routes/`     | **Frontend Pages.** SvelteKit routing (SPA mode).              |
| `src/lib/apps/`   | **Domain Logic.** Isolated features (e.g., `user`, `billing`). |
| `src/lib/shared/` | **UI Kit.** Reusable components and utilities.                 |

## 📦 Building for Production

Experience the power of the **Single Binary Architecture**:

1.  **Build Frontend:**

    ```bash
    pnpm build
    ```

    _(This compiles Svelte into static files inside `pb/pb_public`)_

2.  **Compile Go Binary:**

    ```bash
    cd pb
    go build -o ../myapp
    ```

3.  **Deploy:**
    Upload `myapp` to any VPS (Hetzner/DigitalOcean). Run it. Done.
    ```bash
    ./myapp serve
    ```

## 📜 License

MIT © [Vladimir Beliaev](https://vvbeliaev.cogisoft.dev) from [Cogito Software](https://cogisoft.dev).
Free to use for personal and commercial projects.
