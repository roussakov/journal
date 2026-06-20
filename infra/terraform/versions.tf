terraform {
  required_version = ">= 1.5.0"

  # State in HCP Terraform. Org/workspace from hcp.env (TF_CLOUD_ORGANIZATION, TF_WORKSPACE).
  cloud {}

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.9"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

provider "vercel" {
  # VERCEL_API_TOKEN — personal Hobby account (omit team; set var.vercel_team_id on resources if needed)
}

provider "neon" {
  # NEON_API_KEY
}
