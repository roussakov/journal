resource "vercel_project" "web" {
  name      = var.project_name
  framework = "nextjs"
  team_id   = var.vercel_team_id

  root_directory = "apps/web"
  node_version   = "20.x"

  # pnpm monorepo: install and build from repo root so workspace packages resolve.
  install_command = "cd ../.. && pnpm install --frozen-lockfile"
  build_command   = "cd ../.. && pnpm --filter @journal/web build"

  git_repository = var.enable_git_integration ? {
    type              = "github"
    repo              = var.git_repository
    production_branch = var.production_branch
  } : null

  # Public preview URLs for label-gated PR deploys (see docs/adr/2026-06-23/pr-preview-environments.md).
  vercel_authentication = {
    deployment_type = "none"
  }
}

resource "vercel_project_environment_variables" "web" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id

  variables = [
    for env in local.vercel_env_variables : {
      key       = env.key
      value     = env.value
      target    = env.target
      sensitive = env.sensitive
    }
  ]
}
