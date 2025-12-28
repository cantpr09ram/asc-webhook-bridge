# App Store Connect to Discord Webhook Bridge

A lightweight, serverless bridge running on **Cloudflare Workers** that forwards App Store Connect (ASC) notifications to **Discord**.

It handles the complex **JWS (JSON Web Signature)** decoding required by Apple's API and formats the notifications into beautiful Discord Embeds.

### Quick Start

#### 1. Clone & Install
```bash
git clone <your-repo-url>
cd asc-webhook-bridge
pnpm install
```
#### 2. Configure Secrets
```
npx wrangler secret put DISCORD_WEBHOOK_URL
```

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cantpr09ram/asc-webhook-bridge)