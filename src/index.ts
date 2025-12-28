import { Env, WebhookBody } from './types';
import { decodeJWS, createDiscordEmbed } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }

      let discordPayload;

      // -----------------------------------------------------------
      // Branch A: JWS Encrypted Payload
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
      // Branch B: Raw JSON Events
      // -----------------------------------------------------------
      else if (body.data && body.data.type) {
        const eventType = body.data.type;
        const attr = body.data.attributes || {};
        const rel = body.data.relationships?.instance;
        
        // 1. Extract API Link Early
        const apiLink = rel?.links?.self || null;

        console.log(`Received Raw Event: ${eventType}`);
        
        let title = `App Store Connect Event: ${eventType}`;
        let description = "Received a raw status update.";
        let color = 3447003; // Default Blue
        let fields: any[] = [];
        
        const eventTime = attr.timestamp || new Date().toISOString();

        // [Logic for Build Uploads]
        if (eventType === 'buildUploadStateUpdated') {
            const oldState = attr.oldState || 'UNKNOWN';
            const newState = attr.newState || 'UNKNOWN';

            if (newState === 'COMPLETE') {
                title = "Build Processing Complete";
                description = "The build is ready for TestFlight or Submission.";
                color = 5763719; 
            } else if (newState === 'FAILED') {
                title = "Build Processing Failed";
                description = "Apple failed to process the uploaded binary.";
                color = 15548997; 
            } else {
                title = "Build State Updated";
                description = `State changed: ${oldState} -> ${newState}`;
            }

            fields.push(
                { name: "Old State", value: `\`${oldState}\``, inline: true },
                { name: "New State", value: `**${newState}**`, inline: true }
            );
        }

        // [Logic for App Status Updates]
        else if (eventType === 'appStoreVersionAppVersionStateUpdated') {
            const oldValue = attr.oldValue || 'UNKNOWN';
            const newValue = attr.newValue || 'UNKNOWN';
            const formattedStatus = newValue.replace(/_/g, ' ');

            switch (newValue) {
                case 'PREPARE_FOR_SUBMISSION':
                    title = "Prepare For Submission";
                    color = 3447003; 
                    break;
                case 'WAITING_FOR_REVIEW':
                    title = "Waiting For Review";
                    color = 16776960; 
                    break;
                case 'IN_REVIEW':
                    title = "In Review";
                    color = 15105570; 
                    break;
                case 'REJECTED':
                case 'DEVELOPER_REJECTED':
                    title = "Submission Rejected";
                    color = 15548997; 
                    break;
                case 'READY_FOR_DISTRIBUTION':
                    title = "Ready For Distribution";
                    description = "The app is now Live on the App Store!";
                    color = 5763719; 
                    break;
                case 'READY_FOR_REVIEW':
                    title = "Ready For Review";
                    color = 3447003; 
                    break;
                default:
                    title = `App Status: ${formattedStatus}`;
            }

            fields.push(
                { name: "Previous", value: `\`${oldValue}\``, inline: true },
                { name: "New Status", value: `**${newValue}**`, inline: true }
            );
        }

        else if (eventType === 'webhookPingCreated') {
            title = "Webhook Configured Successfully";
            description = "Test signal received.";
            color = 5763719; 
        }

        // --- Technical Details ---

        // 2. Resource ID
        const targetId = rel?.data?.id;
        if (targetId) {
             fields.push({
                name: "Resource ID",
                value: `\`${targetId}\``,
                inline: false // Changed to false to separate from status
            });
        }

        // 3. API Link (Standalone Field)
        if (apiLink) {
            fields.push({
                name: "Link",
                value: apiLink, // Display the full raw URL
                inline: false   // Force it to be on its own line
            });
        }

        // 4. Raw Payload
        const rawJsonString = JSON.stringify(body, null, 2);
        fields.push({
             name: "Full Raw Payload",
             value: `\`\`\`json\n${rawJsonString.substring(0, 1000)}\n\`\`\``,
             inline: false 
        });

        discordPayload = {
          embeds: [{
            title: title,
            url: apiLink || undefined, // 4. Make the Title clickable!
            description: description,
            color: color,
            fields: fields,
            footer: { text: `Type: ${eventType}` },
            timestamp: eventTime
          }]
        };
      } 
      
      else {
        // Unknown Branch
        const unknownBodyString = JSON.stringify(body, null, 2);
        console.error("Unknown Payload Format:", unknownBodyString);
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