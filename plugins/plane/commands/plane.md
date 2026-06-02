---
description: Use Plane MCP with the ledu workspace and the repo-local project binding rules
argument-hint: "[task]"
---

Follow the Plane plugin skill at skills/plane/SKILL.md before calling any MCP tool.

Rules:

- Use https://plane.ledupeiyou.com and workspace slug ledu.
- Require PLANE_ACCESS_TOKEN to be configured; do not ask for base URL or workspace slug.
- Before any project-scoped MCP tool call, require a concrete project id from the user, a verified Plane URL, the repo-local .plane-project.json binding, or a user choice from list_projects.
- If .plane-project.json is used, state the bound project id, name, and identifier before making project-scoped changes.
- If no binding exists, list projects or verify the project from a user-provided link, fill project name and identifier from Plane, then ask whether to save the selected project as the repo-local binding.
- Repo-local binding may only complete project id, project name, and project identifier. Do not ask for or modify workspace slug, base URL, auth, or global config during binding.
- Read before write: list or retrieve current Plane objects and metadata before create, update, delete, link, relation, cycle, module, label, state, or page operations.
- Pick tools according to the official Plane MCP tool groups described in skills/plane/SKILL.md.
- Keep credentials and project binding out of global Claude, shell, and user-level config.

User task:

$ARGUMENTS
