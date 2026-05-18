// Extend the CloudflareEnv global interface (from @opennextjs/cloudflare)
// with the bindings declared in wrangler.toml
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    R2: R2Bucket;
  }
}

export {};
