# Vercel AI Gateway — no dedicated Terraform resource; auth is runtime OIDC on Vercel
# (VERCEL_OIDC_TOKEN) or optional AI_GATEWAY_API_KEY for local/preview testing.
# See https://vercel.com/docs/ai-gateway/authentication

locals {
  ai_gateway_env_variables = concat(
    [
      {
        key       = "EMBEDDING_PROVIDER"
        value     = "vercel-gateway"
        sensitive = false
      },
      {
        key       = "EMBEDDING_MODEL"
        value     = "openai/text-embedding-3-small"
        sensitive = false
      },
      {
        key       = "EMBEDDING_DIMENSIONS"
        value     = "1536"
        sensitive = false
      },
    ],
    var.ai_gateway_api_key != null ? [
      {
        key       = "AI_GATEWAY_API_KEY"
        value     = var.ai_gateway_api_key
        sensitive = true
      },
    ] : [],
  )
}

output "ai_gateway_auth_mode" {
  description = "Prod embeddings use VERCEL_OIDC_TOKEN on Vercel. Set ai_gateway_api_key in tfvars for an explicit AI_GATEWAY_API_KEY (local/preview)."
  value       = "vercel-oidc-or-api-key"
}
