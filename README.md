## App Store Connect Webhook to Discord Bridge

A lightweight, serverless bridge running on [**Cloudflare Workers**](https://workers.cloudflare.com/) that forwards [**App Store Connect API Webhook**](https://developer.apple.com/documentation/appstoreconnectapi/webhook-notifications) to [**Discord**](https://discord.com/).

It handles the complex **JWS (JSON Web Signature)** decoding required by Apple's API and formats the notifications into beautiful Discord Embeds.

Quick Start
1. Clone & Install
```bash
git clone <your-repo-url>
cd asc-webhook-bridge
pnpm install
```
2. Configure Secrets
```bash
npx wrangler secret put DISCORD_WEBHOOK_URL
```
3. Deploy
```bash
npx waangler deploy
```
> [!WARNING]
> The raw JSON payload structures used in this project are derived from community observations and the article [App Store Connect API Webhook 串接](https://zhgchg.li/posts/zrealm-dev/en/app-store-connect-api-webhook-automate-ci-cd-workflows-seamlessly-7c0974856393/), rather than strict official documentation.
>
> While these formats work for current "Test" button actions and status updates, Apple may change these undocumented raw payloads without notice. If you encounter an **"Unknown Payload Format"** error in the future, please check your Cloudflare Worker logs (`npx wrangler tail`) to verify if the JSON structure has changed.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cantpr09ram/asc-webhook-bridge)

