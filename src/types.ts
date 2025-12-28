// src/types.ts

// 1. Cloudflare Workers Environment Variables
export interface Env {
  DISCORD_WEBHOOK_URL: string;
}

// 2. Apple Official Notification Payload (Encrypted JWS)
export interface AppleJWSPayload {
  signedPayload: string;
}

// 3. Apple Raw JSON Payload (Unencrypted)
// Used for Test Pings, Build Updates, and App Status Updates
export interface AppleRawPayload {
  data: {
    type: string; 
    id: string;
    attributes: {
      timestamp?: string;
      // For App Version Updates
      newValue?: string; 
      oldValue?: string;
      // For Build Uploads
      oldState?: string;
      newState?: string;
      // Allow other unknown attributes
      [key: string]: any; 
    };
    // Relationship data containing IDs and Links
    relationships?: {
      instance?: {
        data?: {
          type: string;
          id: string;
        };
        links?: {
          self: string;
        };
      };
    };
  };
}

// 4. Union Type: Body can be either JWS or Raw JSON
export type WebhookBody = AppleJWSPayload | AppleRawPayload;

// 5. Decoded JWS Structure
export interface DecodedPayload {
  notificationType: string;
  subtype?: string;
  notificationUUID: string;
  version: string;
  signedDate: number;
  summary?: string;
  data?: {
    app?: {
      bundleId: string;
      adamId: number;
      appName?: string;
    };
    build?: {
      version: string;
      uploadedDate: string;
    };
    environment?: string;
  };
}

export interface DecodedHeader {
  alg: string;
  x5c: string[];
}