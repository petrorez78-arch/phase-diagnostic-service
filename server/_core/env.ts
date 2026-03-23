const pickFirst = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
};

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Backward-compatible aliases for former Manus Forge configuration.
  forgeApiUrl: pickFirst(
    process.env.BUILT_IN_FORGE_API_URL,
    process.env.OPENAI_BASE_URL,
    "https://api.openai.com"
  ),
  forgeApiKey: pickFirst(
    process.env.BUILT_IN_FORGE_API_KEY,
    process.env.OPENAI_API_KEY
  ),

  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  storageDir: process.env.STORAGE_DIR ?? "uploads",
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "",
  notificationWebhookUrl: process.env.NOTIFICATION_WEBHOOK_URL ?? "",
};
