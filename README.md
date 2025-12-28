App Store Connect Webhook to Discord Bridge

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

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cantpr09ram/asc-webhook-bridge)
