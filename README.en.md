# Ledu Plane Plugin Marketplace

[中文文档](./README.md)

This repository is a marketplace for the Plane plugin used with Codex and Claude Code.

Repository URL:

    https://github.com/xuhongbo/plugins

The plugin lives in `plugins/plane/` and bundles the Plane MCP server plus both plugin manifests:

- Codex: `plugins/plane/.codex-plugin/plugin.json`
- Claude Code: `plugins/plane/.claude-plugin/plugin.json`
- MCP server config: `plugins/plane/.mcp.json`
- Plane workflow skill: `plugins/plane/skills/plane/SKILL.md`

The plugin is preconfigured for `https://plane.ledupeiyou.com` and workspace slug `ledu`. Users provide only `PLANE_ACCESS_TOKEN`.

## Prerequisites

- Codex or Claude Code with plugin support.
- `uv` available on the machine that runs the plugin.
- A Plane Personal Access Token with access to workspace `ledu`.

Do not commit `PLANE_ACCESS_TOKEN`. Configure it in your local agent environment or plugin auth surface.

## Install In Codex

Register this repository as a Codex marketplace:

    codex plugin marketplace add https://github.com/xuhongbo/plugins

Open the Codex plugin UI or plugin command flow and install `plane` from the `Ledu Plane` marketplace.

After installation, set `PLANE_ACCESS_TOKEN` locally for Codex, then restart or re-enable the plugin so the bundled MCP server can start.

## Install In Claude Code

From inside an interactive Claude Code session, register this repository as a marketplace:

    /plugin marketplace add https://github.com/xuhongbo/plugins

Then install:

    /plugin install plane@ledu-plane
    /reload-plugins

The equivalent terminal CLI commands are:

    claude plugin marketplace add https://github.com/xuhongbo/plugins
    claude plugin install plane@ledu-plane

After installation, configure `PLANE_ACCESS_TOKEN` in your Claude Code environment or plugin auth surface. The plugin also exposes the Claude command:

    /plane <task>

That command follows the same project-id and read-before-write rules as the Codex skill.

## Repository Project Binding

The repo-local default Plane project is stored in `.plane-project.json`. Keep that binding in this repository only; do not copy it into global Codex, Claude, shell, or user config.

Current default binding:

- `workspace_slug`: `ledu`
- project id: `2ff67848-d1d2-4b41-bc47-6c975294c479`
- project name: `plane_feature`
- project identifier: `PF`

To regenerate it:

    node scripts/write-plane-project-binding.mjs

When a user asks the plugin to call Plane MCP for project-scoped work, the agent must use an explicit project id from the user or read this repo-local binding first.
