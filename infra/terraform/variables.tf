variable "project_name" {
  description = "Name shared by the Vercel project and Neon database project."
  type        = string
  default     = "journal"
}

variable "vercel_production_hostname" {
  description = "Production *.vercel.app hostname (Vercel dashboard → Project → Settings → Domains). Not always {project_name}.vercel.app."
  type        = string
}

variable "vercel_team_id" {
  description = "Vercel team ID. Leave null for the personal Hobby account."
  type        = string
  default     = null
}

variable "git_repository" {
  description = "GitHub repo in owner/name form for automatic Vercel deployments."
  type        = string
  default     = "roussakov/journal"
}

variable "enable_git_integration" {
  description = "Connect the Vercel project to GitHub for push-to-deploy. Requires GitHub linked in Vercel account settings."
  type        = bool
  default     = false
}

variable "neon_org_id" {
  description = "Neon organization ID (Neon console → Organization settings)."
  type        = string
}

variable "production_branch" {
  description = "Git branch treated as Vercel production."
  type        = string
  default     = "master"
}

variable "neon_region_id" {
  description = "Neon region (free tier). See https://neon.tech/docs/introduction/regions"
  type        = string
  default     = "aws-us-east-1"
}

variable "neon_pg_version" {
  description = "Postgres major version for Neon (matches local pgvector:pg17)."
  type        = number
  default     = 17
}

variable "neon_suspend_timeout_seconds" {
  description = "Neon scale-to-zero after idle seconds (free-tier friendly)."
  type        = number
  default     = 300
}

variable "mcp_api_key" {
  description = "Bearer token for MCP_API_KEY. Generated when null."
  type        = string
  default     = null
  sensitive   = true
}

variable "ai_gateway_api_key" {
  description = "Optional AI Gateway key. On Vercel, VERCEL_OIDC_TOKEN is preferred and set automatically."
  type        = string
  default     = null
  sensitive   = true
}

variable "apply_prod_migrations" {
  description = "Run pnpm db:migrate against Neon after project creation."
  type        = bool
  default     = true
}
