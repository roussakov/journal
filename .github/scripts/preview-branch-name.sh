#!/usr/bin/env bash
# Derive the Neon preview branch name for a pull request.
#
# Usage:
#   PR_NUMBER=42 HEAD_REF=feat/entry-metadata .github/scripts/preview-branch-name.sh
#
# Output (stdout): preview/pr-42-entry-metadata

set -euo pipefail

if [[ -z "${PR_NUMBER:-}" ]]; then
  echo "preview-branch-name.sh: PR_NUMBER is required" >&2
  exit 1
fi

if [[ -z "${HEAD_REF:-}" ]]; then
  echo "preview-branch-name.sh: HEAD_REF is required" >&2
  exit 1
fi

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "preview-branch-name.sh: PR_NUMBER must be a positive integer (got: $PR_NUMBER)" >&2
  exit 1
fi

# Lowercase; runs of non-alphanumeric → single hyphen; trim to 40 chars; strip edge hyphens.
slug=$(
  printf '%s' "$HEAD_REF" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-+|-+$//g' \
    | cut -c1-40 \
    | sed -E 's/^-+|-+$//g'
)

if [[ -z "$slug" ]]; then
  slug="branch"
fi

printf 'preview/pr-%s-%s\n' "$PR_NUMBER" "$slug"
