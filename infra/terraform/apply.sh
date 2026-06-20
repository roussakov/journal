#!/usr/bin/env bash
# Run Terraform against HCP workspace journal-prod with provider credentials.
set -euo pipefail

cd "$(dirname "$0")"

if [[ -x ./.bin/terraform ]]; then
  export PATH="$(pwd)/.bin:$PATH"
fi

if [[ ! -f hcp.env ]]; then
  echo "Missing hcp.env — copy hcp.env.example and add your tokens." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source hcp.env
# HCP Terraform CLI auth (both names for compatibility across Terraform versions)
if [[ -n "${TF_API_TOKEN:-}" ]]; then
  export TF_TOKEN_app_terraform_io="$TF_API_TOKEN"
fi
set +a

missing=()
[[ -z "${TF_API_TOKEN:-}" ]] && missing+=("TF_API_TOKEN")
[[ -z "${VERCEL_API_TOKEN:-}" ]] && missing+=("VERCEL_API_TOKEN")
[[ -z "${NEON_API_KEY:-}" ]] && missing+=("NEON_API_KEY")
[[ -z "${NEON_ORG_ID:-}" ]] && missing+=("NEON_ORG_ID")
[[ -z "${TF_CLOUD_ORGANIZATION:-}" ]] && missing+=("TF_CLOUD_ORGANIZATION")
[[ -z "${TF_WORKSPACE:-}" ]] && missing+=("TF_WORKSPACE")

if ((${#missing[@]} > 0)); then
  echo "Set these in hcp.env: ${missing[*]}" >&2
  exit 1
fi

mkdir -p .terraform.d
python3 - <<'PY'
import json
import os
from pathlib import Path

token = os.environ["TF_API_TOKEN"]
Path(".terraform.d/credentials.tfrc.json").write_text(
    json.dumps({"credentials": {"app.terraform.io": {"token": token}}}),
    encoding="utf-8",
)
PY

export TF_VAR_neon_org_id="${NEON_ORG_ID}"

export TF_CLI_CONFIG_FILE="$(pwd)/.terraformrc"
cat > .terraformrc <<EOF
credentials_helper "automatic" {}
EOF

cmd="${1:-plan}"
shift || true

case "$cmd" in
  init) terraform init "$@" ;;
  plan) terraform plan "$@" ;;
  apply) terraform apply "$@" ;;
  *) terraform "$cmd" "$@" ;;
esac
