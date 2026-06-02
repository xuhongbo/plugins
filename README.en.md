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

## Fastest Install

If you are already in Codex or Claude Code, send the matching prompt directly to the AI agent.

Codex:

> Install the Ledu Plane plugin. The marketplace repository is `https://github.com/xuhongbo/plugins`, and the plugin name is `plane`. After installation, confirm that the bundled Plane MCP server is registered, and remind me to configure `PLANE_ACCESS_TOKEN`. Do not create or modify a repo-local Plane project binding unless I confirm.

Claude Code:

> Install the Ledu Plane plugin. The marketplace repository is `https://github.com/xuhongbo/plugins`, and the install target is `plane@ledu-plane`. After installation, run `/reload-plugins`, confirm that the bundled Plane MCP server is registered, and remind me to configure `PLANE_ACCESS_TOKEN`. Do not create or modify a repo-local Plane project binding unless I confirm.

If the current AI agent cannot manage plugins, or if you prefer doing it manually, use the commands below.

## Prerequisites

- Codex or Claude Code with plugin support.
- `uv` available on the machine that runs the plugin.
- A Plane Personal Access Token with access to workspace `ledu`.

Do not commit `PLANE_ACCESS_TOKEN`. Configure it in your local agent environment or plugin auth surface.

## Manual Codex Install

Register this repository as a Codex marketplace:

    codex plugin marketplace add https://github.com/xuhongbo/plugins

Open the Codex plugin UI or plugin command flow and install `plane` from the `Ledu Plane` marketplace.

After installation, set `PLANE_ACCESS_TOKEN` locally for Codex, then restart or re-enable the plugin so the bundled MCP server can start.

## Manual Claude Code Install

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

The repo-local Plane project binding is stored in `.plane-project.json`. Keep that binding in this repository only; do not copy it into global Codex, Claude, shell, or user config.

To create it:

    node scripts/write-plane-project-binding.mjs

The plugin workspace slug is fixed to `ledu`. The script does not ask for or allow workspace changes; it asks the user one question at a time for the project binding:

- project id
- project name
- project identifier

You can also generate it with explicit arguments:

    node scripts/write-plane-project-binding.mjs \
      --project-id <uuid> \
      --project-name <name> \
      --project-identifier <identifier>

When a user asks the plugin to call Plane MCP for project-scoped work, the agent must resolve a concrete project id first: use an explicit project id or repo-local binding when available; otherwise verify a user-provided Plane link or list projects for the user to choose from. The agent should fill project name and project identifier from Plane results instead of asking the user to type associated metadata. Ask before saving a repo-local binding.
