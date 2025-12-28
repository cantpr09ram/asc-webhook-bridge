export interface Env {
  DISCORD_WEBHOOK_URL: string;
}

export interface AppleJWSPayload {
  signedPayload: string;
}

export interface ApplePingPayload {
  data: {
    type: "webhookPingCreated";
    id: string;
    version: number;
    attributes: {
      timestamp: string;
    };
  };
}

export type WebhookBody = AppleJWSPayload | ApplePingPayload;

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