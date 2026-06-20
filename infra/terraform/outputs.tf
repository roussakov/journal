output "vercel_project_id" {
  description = "Vercel project ID."
  value       = vercel_project.web.id
}

output "vercel_project_name" {
  description = "Vercel project name."
  value       = vercel_project.web.name
}

output "vercel_deployment_url" {
  description = "Production URL."
  value       = "https://${var.vercel_production_hostname}"
}

output "vercel_production_hostname" {
  description = "Production *.vercel.app hostname (set in terraform.tfvars)."
  value       = var.vercel_production_hostname
}

output "mcp_endpoint_url" {
  description = "Production MCP endpoint (HTTPS)."
  value       = "https://${var.vercel_production_hostname}/api/mcp"
}

output "neon_project_id" {
  description = "Neon project ID."
  value       = neon_project.journal.id
}

output "neon_database_host" {
  description = "Neon database host (direct connection)."
  value       = neon_project.journal.database_host
}

output "neon_database_name" {
  description = "Neon database name."
  value       = neon_project.journal.database_name
}

output "mcp_api_key" {
  description = "Generated or supplied MCP_API_KEY (store securely; also set in Vercel)."
  value       = local.mcp_api_key
  sensitive   = true
}
