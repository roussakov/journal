resource "neon_project" "journal" {
  name       = var.project_name
  org_id     = var.neon_org_id
  pg_version = var.neon_pg_version
  region_id  = var.neon_region_id

  # Free tier caps: history retention max 21600s; suspend_timeout 0 = account default.
  history_retention_seconds = 21600

  default_endpoint_settings {
    suspend_timeout_seconds = 0
  }

  branch {
    name          = "main"
    database_name = "journal"
    role_name     = "journal"
  }
}

resource "null_resource" "prod_migrations" {
  count = var.apply_prod_migrations ? 1 : 0

  triggers = {
    project_id = neon_project.journal.id
  }

  provisioner "local-exec" {
    command     = "pnpm db:migrate"
    working_dir = abspath("${path.module}/../..")
    environment = {
      DATABASE_URL          = neon_project.journal.connection_uri
      EMBEDDING_DIMENSIONS  = "1536"
    }
  }

  depends_on = [neon_project.journal]
}
