export * from "./environment.js";
export * from "./proxies.js";
export * from "./branding.js";

/**
 * Return a base64 encoded JSON string containing the given `env` object.
 */
export const encodeEnv = (env: object, exclude?: string[]): string => {
  const filtered = exclude ? Object.fromEntries(Object.entries(env).filter(([key]) => !exclude.includes(key))) : env;

  return btoa(JSON.stringify(filtered));
};

/**
 * Return an objects from a base64 encoded JSON string.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const decodeEnv = (env: string): object => (env ? JSON.parse(atob(env)) : {});
