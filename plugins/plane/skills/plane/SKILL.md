---
name: plane
description: Use this skill whenever the user wants to read, create, update, triage, plan, summarize, or report on Plane data in the ledu workspace through the Plane MCP server. This includes project status, work items, cycles/sprints, modules, epics, intake requests, pages/docs, labels, states, comments, links, relations, and any request that says to sync work into Plane. Always use this skill before calling Plane MCP tools, even if the user does not explicitly mention "Plane MCP".
---

# Plane

## Purpose

Use Plane as the source of truth for project management in the ledu workspace. The agent should operate like a careful project operator: resolve the correct project, read current Plane state, choose the narrowest official MCP tool path, then write only the requested change.

This plugin is preconfigured for:

- Base URL: https://plane.ledupeiyou.com
- Workspace slug: ledu
- Auth: PLANE_ACCESS_TOKEN only
- Transport: bundled Plane MCP server over stdio for local agent use

## Hard Rules

- Do not call project-scoped Plane MCP tools until a concrete project id is known.
- If the user does not provide a project id, read the repo-local .plane-project.json from the current repository root.
- If .plane-project.json exists, state the bound project id, name, and identifier before project-scoped writes.
- If no project id and no repo-local binding are available, resolve the project by parsing a user-provided Plane URL and verifying it, or by listing projects and asking the user to choose.
- Do not infer project scope from a project name, identifier, unverified URL fragment, recent conversation, or memory alone.
- Do not ask for or modify workspace slug, base URL, or auth during repo-local project binding. The plugin workspace is fixed to ledu; only project id, project name, and project identifier may be completed.
- After resolving a project id, use retrieve_project or the selected list_projects result to fill project name and project identifier automatically instead of asking the user to type them when Plane can provide them.
- Ask before writing .plane-project.json. If the user declines, use the selected project only for the current task.
- Do not store project binding in global Codex, Claude, shell, or user-level config.
- Do not commit or echo PLANE_ACCESS_TOKEN.
- Read before write. Resolve current IDs, states, labels, work item types, and feature availability before creating, updating, deleting, linking, or moving objects.
- Ask for confirmation before destructive or broad operations: delete, archive, unarchive, bulk state changes, bulk cycle transfer, bulk module reassignment, or broad label/state creation.
- Avoid Plane MCP calls for generic advice or local-only repo analysis. Offer to sync to Plane only after the target project id is clear.

## Official Plane Model

Plane organizes work in this hierarchy:

- Workspace: top-level collaboration space containing projects, members, work items, cycles, modules, pages, labels, states, and workspace-level settings.
- Project: the main container for team work. A project contains work items, cycles, modules, pages, members, states, labels, features, and project settings.
- Work item: the fundamental unit of work. Use for tasks, bugs, features, follow-ups, and tracked implementation items.
- Cycle: a time-boxed sprint or iteration. Use for work that must be planned, tracked, or rolled over inside a delivery window.
- Module: a focused feature, component, or delivery area. Use for grouping related work items across one or more cycles.
- Epic: a larger objective grouping related work items, usually spanning multiple cycles or modules.
- Intake: the triage layer for incoming requests before they become normal project backlog work.
- Page: project or workspace documentation. Use for requirements, plans, specs, notes, decisions, and knowledge that should live beside work.
- Project update: status communication for stakeholders. Use On Track, At Risk, or Off Track style updates when reporting progress or blockers.
- Relation/dependency: structured relationship between work items. Use for blocking, duplicate, dependency, or contextual relation when a plain link/comment is not enough.

## Workflow

### 1. Establish Connection

If Plane tools are unavailable, ask the user to enable the plugin and configure PLANE_ACCESS_TOKEN. Do not ask for base URL or workspace slug unless the user explicitly wants to override this enterprise default.

### 2. Resolve Scope

Use this order:

1. Explicit project id from the user.
2. repo-local .plane-project.json.
3. Verified Plane URL that identifies a project.
4. list_projects, then ask the user to choose.

When using .plane-project.json, treat it as repo-local only. It is a convenience binding, not a global default. It may record the fixed workspace slug for context, but binding setup must not let users change workspace slug or base URL.

After scope is resolved from a URL, list selection, or explicit project id, retrieve or reuse the current Project object and carry forward its id, name, and identifier. Ask the user only to choose or confirm the project, not to manually fill metadata that Plane already returned.

### 3. Classify Intent

Pick the workflow based on what the user is trying to do:

- Workspace or access question: inspect workspace/user/project membership before project work.
- Project status or overview: retrieve project, members, features, cycles/modules, and relevant open work items.
- Work item search: search first, then retrieve specific items if editing.
- Create work: read project metadata first, then create work items with minimum required fields.
- Update work: retrieve the current work item first, then update only requested fields.
- Sprint planning: use cycles, not modules, when the request is time-boxed.
- Feature grouping: use modules when the request is about a product area, component, milestone-like feature bucket, or cross-cycle grouping.
- Large objective: use epics when the work spans multiple modules/cycles or should track aggregate progress.
- Incoming request triage: use intake tools before turning requests into backlog work.
- Documentation: use pages when the output is a spec, plan, decision log, meeting note, or durable project knowledge.
- Progress communication: use comments for item-level progress; use project updates for project-level status and risk.
- Dependency modeling: use relations/dependencies for blocking or duplicate relationships; use links for external URLs and artifacts.

### 4. Read Current State

Before writing, read only the relevant current state:

- Workspace/user: get_me, get_workspace_members, get_workspace_features.
- Projects: list_projects, retrieve_project, get_project_members, get_project_features.
- Work items: search_work_items, list_work_items, retrieve_work_item, retrieve_work_item_by_identifier.
- Planning: list_cycles, list_modules, list_milestones.
- Taxonomy: list_states, list_labels, list_work_item_types, list_work_item_properties.
- Collaboration: list_work_item_comments, list_work_item_activities, list_work_item_links, list_work_item_relations, list_work_logs.
- Pages: list project/workspace pages before creating or linking documentation.
- Intake: list intake items before accepting, declining, marking duplicate, or deleting.

### 5. Check Feature Availability

Some Plane features can be enabled or disabled per project. Before using cycles, modules, pages, intake, epics, estimates, time tracking, or custom properties, inspect project features or list the relevant objects. If a feature appears disabled or unavailable, report that instead of forcing a write.

## Tool Selection

Use these official MCP tool groups by intent.

### Projects

- Use list_projects to discover projects or validate a user's project id/name/identifier.
- Use retrieve_project when you already have a project id and need details.
- Use get_project_members before assigning or reporting ownership.
- Use get_project_features before using optional project features.
- Use update_project_features only when the user explicitly asks to enable or disable a feature.
- Prefer archive over delete when the user says the project is inactive or done. Delete only after explicit confirmation.

### Work Items

- Use search_work_items for keyword, identifier, blocker, or cross-project discovery.
- Use list_work_items for project backlog, queue, filter, cycle/module slice, and reporting.
- Use retrieve_work_item or retrieve_work_item_by_identifier before editing one item.
- Use create_work_item after project id and required metadata are known.
- Use update_work_item for state, priority, assignee, label, estimate, dates, cycle, module, description, or parent changes.
- Use delete_work_item only after explicit confirmation.
- Use work item types/properties before setting type-specific fields or custom properties.

### Comments, Links, Relations, Activities

- Use create_work_item_comment for progress updates, execution notes, review findings, and decisions tied to one work item.
- Use create_work_item_link for PRs, docs, deployment URLs, logs, screenshots, and external artifacts.
- Use relation tools for duplicate, blocked-by, blocking, dependency, related, implemented-by, or similar structured relationships.
- Use activities when the user asks what changed, who changed it, or recent history.

### Cycles

- Use cycles for sprint-like, date-bounded planning.
- Create cycles only with clear start/end dates or explicit user intent.
- Before adding work items to a cycle, list/retrieve the target cycle and target work items.
- Use transfer_cycle_work_items or equivalent transfer only for rollover or sprint migration, and confirm the source and destination cycles first.
- Do not put work into a cycle merely because it has the same label or module unless the user requested that planning action.

### Modules

- Use modules for feature/component grouping, not for sprint planning.
- Before creating a module, check whether a suitable module already exists.
- Add work items to a module when they belong to the same feature area, deliverable, or product slice.
- A module may span cycles; do not treat module membership as a schedule by itself.

### Epics and Initiatives

- Use epics for large work packages that need progress tracking across related work items.
- Use initiatives for workspace-level direction or multi-project goals when available.
- Do not create epics/initiatives for small tasks that fit as one work item or a module.

### Intake

- Use intake tools when the user asks to triage incoming requests, customer asks, unreviewed bugs, feature requests, or backlog candidates.
- For intake triage, list pending intake items, inspect details, then accept, decline, mark duplicate, or comment based on user instruction.
- When accepting intake into backlog, preserve source context in description, comment, or link.

### Pages and Docs

- Use pages for durable project knowledge: requirements, design notes, runbooks, meeting notes, retrospectives, decision records, and status docs.
- Prefer linking or mentioning relevant work items from pages when documentation creates actionable follow-up.
- If the user asks for a plan that should survive chat context, create or update a Plane page when project id and page scope are clear.

### Labels, States, Types, Properties

- Use labels for categorization, not workflow stage.
- Use states for workflow progression.
- Before creating a label or state, list existing ones and reuse matches when possible.
- Do not create taxonomy churn. Ask before adding new labels/states/types/properties unless the user explicitly requested it.

### Project Updates

- Use project updates for stakeholder-facing progress, risk, and blocker communication.
- Use On Track when work is proceeding as planned.
- Use At Risk when blockers, dependencies, scope growth, or resource concerns may affect schedule.
- Use Off Track when major blockers or delays require immediate attention.
- Use work item comments instead when the update only concerns one item.

## Response Contract

After Plane work, report:

- Scope used: workspace slug and project id/name/identifier.
- Reads performed: the important objects or metadata checked.
- Writes performed: created, updated, linked, moved, commented, archived, or deleted objects.
- Plane identifiers or URLs when available.
- Anything not done because of missing permissions, missing project id, disabled features, ambiguous input, or schema mismatch.
- For read-only tasks, clearly separate observed Plane data from recommendations.

## Examples

User: "Create tasks for this implementation plan."
Action: Resolve project id from user or .plane-project.json, read states/labels/work item types, create focused work items, then report identifiers.

User: "Move unfinished Sprint 23 work into Sprint 24."
Action: Resolve project id, list cycles, confirm source/destination cycles, list incomplete source work items, then transfer after confirmation.

User: "Summarize project health."
Action: Retrieve project, members, features, active cycles/modules, open blockers and recent comments; write nothing unless asked.

User: "Turn this spec into Plane docs."
Action: Resolve project id, list pages, create or update a project page, link relevant work items if requested.
