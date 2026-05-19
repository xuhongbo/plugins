# Plane Plugin

This plugin packages the Plane MCP server for Codex and Claude Code.

It is preconfigured for:

- Plane base URL: https://plane.ledupeiyou.com
- Workspace slug: ledu
- Credential: PLANE_ACCESS_TOKEN

Do not commit PLANE_ACCESS_TOKEN. Configure it in the local agent environment or plugin auth surface.

## Project Scope

Project-scoped MCP calls require a concrete Plane project id. For this repository, the default project binding is stored in the repo root at .plane-project.json.

Agents should read that file before using a default project and should not store the binding in global Codex, Claude, shell, or user-level config.

## Local Validation

Run these checks from the repository root:

    python -m json.tool plugins/plane/.codex-plugin/plugin.json >/dev/null
    python -m json.tool plugins/plane/.claude-plugin/plugin.json >/dev/null
    python -m json.tool plugins/plane/.mcp.json >/dev/null
    bash -n plugins/plane/scripts/run-plane-mcp.sh
    python -m py_compile plugins/plane/plane_mcp/__main__.py plugins/plane/plane_mcp/client.py
