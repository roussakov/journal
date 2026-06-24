locals {
  mcp_api_key = coalesce(var.mcp_api_key, random_password.mcp_api_key[0].result)

  vercel_env_targets                 = ["production", "preview"]
  vercel_env_targets_production_only = ["production"]

  vercel_env_variables = concat(
    [
      {
        key       = "DATABASE_URL"
        value     = neon_project.journal.connection_uri_pooler
        sensitive = true
        target    = local.vercel_env_targets_production_only
      },
      {
        key       = "DATABASE_POOL_MAX"
        value     = "1"
        sensitive = false
        target    = local.vercel_env_targets
      },
      {
        key       = "DATABASE_POOL_IDLE_TIMEOUT"
        value     = "0"
        sensitive = false
        target    = local.vercel_env_targets
      },
      {
        key       = "DATABASE_POOL_CONNECT_TIMEOUT"
        value     = "30"
        sensitive = false
        target    = local.vercel_env_targets
      },
      {
        key       = "DATABASE_POOL_MAX_LIFETIME"
        value     = "1800"
        sensitive = false
        target    = local.vercel_env_targets
      },
      {
        key       = "MCP_API_KEY"
        value     = local.mcp_api_key
        sensitive = true
        target    = local.vercel_env_targets
      },
    ],
    local.ai_gateway_env_variables,
  )
}

resource "random_password" "mcp_api_key" {
  count = var.mcp_api_key == null ? 1 : 0

  length  = 32
  special = false
}
