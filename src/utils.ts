import { DecodedPayload } from './types';

export function decodeJWS(token: string): DecodedPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWS format');
    
    // Step 1: Convert Base64Url to Base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + '='.repeat(padLen);
    
    // Step 2: Support UTF-8 to handle non-ASCII characters
    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const jsonString = new TextDecoder('utf-8').decode(bytes);

    return JSON.parse(jsonString) as DecodedPayload;
  } catch (error) {
    console.error("JWS Decode Error:", error);
    throw new Error('Failed to decode JWS token');
  }
}

export function createDiscordEmbed(data: DecodedPayload) {
  const type = data.notificationType;
  const subType = data.subtype || "";
  const bundleId = data.data?.app?.bundleId || "Unknown App";
  const version = data.data?.build?.version || "N/A";
  
  // Color logic: failure=red (0xE74C3C), success/ready=green (0x2ECC71), otherwise=blue (0x3498DB)
  let color = 0x3498DB;
  if (type.includes("FAIL")) color = 0xE74C3C;
  if (type.includes("SUCCESS") || type.includes("READY") || type.includes("PROCESSED")) color = 0x2ECC71;

  return {
    content: null, // Set to null to show only the embed
    embeds: [
      {
        title: `${type.replace(/_/g, ' ')}`,
        description: data.summary || `Event: ${subType}`,
        color: color,
        fields: [
          { name: "App Bundle ID", value: `\`${bundleId}\``, inline: true },
          { name: "Version", value: `\`${version}\``, inline: true },
          { name: "Environment", value: data.data?.environment || "Production", inline: true }
        ],
        footer: { text: `UUID: ${data.notificationUUID}` },
        timestamp: new Date(data.signedDate).toISOString()
      }
    ]
  };
}