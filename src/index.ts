// src/index.ts
import { Env, WebhookBody, AppleJWSPayload, ApplePingPayload } from './types';
import { decodeJWS, createDiscordEmbed } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      // Parse request body as JSON
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }

      let discordPayload;

      // -----------------------------------------------------------
      // Branch A: Handle real notifications
      // -----------------------------------------------------------
      if (body.signedPayload) {
        try {
          const decodedData = decodeJWS(body.signedPayload);
          discordPayload = createDiscordEmbed(decodedData);
          console.log(`Processed Event: ${decodedData.notificationType}`);
        } catch (e) {
          console.error("JWS Decode Failed:", e);
          return new Response('Invalid JWS Token', { status: 400 });
        }
      }

      // -----------------------------------------------------------
      // Branch B: Handle test pings
      // -----------------------------------------------------------
      else if (body.data && body.data.type === 'webhookPingCreated') {
        console.log("Received Test Ping from App Store Connect");

        discordPayload = {
          content: "**Webhook configured successfully!**",
          embeds: [
            {
              title: "App Store Connect Test Ping",
              description: "Received a connection test request from Apple. The system is operating normally.",
              color: 3066993, // Green
              fields: [
                {
                  name: "Ping ID",
                  value: `\`${body.data.id}\``,
                  inline: true
                },
                {
                  name: "Time",
                  value: body.data.attributes?.timestamp || new Date().toISOString(),
                  inline: true
                }
              ],
              footer: {
                text: "ASC Bridge Status: Online"
              },
              timestamp: new Date().toISOString()
            }
          ]
        };
      }

      // -----------------------------------------------------------
      // Branch C: Handle unknown payloads
      // -----------------------------------------------------------
      else {
        console.error("Unknown Payload Format:", JSON.stringify(body));
        return new Response('Bad Request: Unknown Payload Format', { status: 400 });
      }

      if (!env.DISCORD_WEBHOOK_URL) {
        throw new Error("DISCORD_WEBHOOK_URL is not set");
      }

      const discordResp = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (!discordResp.ok) {
        return new Response(`Discord Error: ${await discordResp.text()}`, { status: 502 });
      }

      return new Response('Processed Successfully', { status: 200 });

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown Error';
      console.error(msg);
      return new Response(`Server Error: ${msg}`, { status: 500 });
    }
  },
};
