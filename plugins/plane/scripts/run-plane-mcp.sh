#!/usr/bin/env bash
set -euo pipefail

configured_env() {
  local name="$1"
  local value="${!name-}"
  if [[ "$value" == "\${${name}}" ]]; then
    value=""
  fi
  printf '%s' "$value"
}

plugin_root="${CODEX_PLUGIN_ROOT-}"
if [[ -z "$plugin_root" ]]; then
  plugin_root="${CLAUDE_PLUGIN_ROOT-}"
fi
if [[ -z "$plugin_root" ]]; then
  plugin_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

plane_base_url="$(configured_env PLANE_BASE_URL)"
plane_access_token="$(configured_env PLANE_ACCESS_TOKEN)"
plane_workspace_slug="$(configured_env PLANE_WORKSPACE_SLUG)"
if [[ -z "$plane_base_url" ]]; then
  plane_base_url="https://plane.ledupeiyou.com"
fi
if [[ -z "$plane_workspace_slug" ]]; then
  plane_workspace_slug="ledu"
fi

missing=()
if [[ -z "$plane_access_token" ]]; then
  missing+=("PLANE_ACCESS_TOKEN")
fi

if (( ${#missing[@]} > 0 )); then
  {
    echo "Plane plugin authorization is required before MCP tools can start."
    echo "Configure PLANE_ACCESS_TOKEN locally, then restart or re-enable the plugin."
    echo
    echo "Missing:"
    for item in "${missing[@]}"; do
      echo "- $item"
    done
    echo
    echo "Required environment:"
    echo "- PLANE_ACCESS_TOKEN: Personal Access Token for https://plane.ledupeiyou.com workspace ledu"
  } >&2
  exit 78
fi

export PLANE_BASE_URL="$plane_base_url"
export PLANE_WORKSPACE_SLUG="$plane_workspace_slug"
unset PLANE_API_KEY
export PLANE_ACCESS_TOKEN="$plane_access_token"

cd "$plugin_root"
exec uv run --project "$plugin_root" plane-mcp-server stdio

