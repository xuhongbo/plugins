#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const binding = {
  scope: "repo-local",
  workspace_slug: "ledu",
  project: {
    id: "2ff67848-d1d2-4b41-bc47-6c975294c479",
    name: "plane_feature",
    identifier: "PF",
  },
  note: "当前仓库的默认 Plane 项目绑定。不要把该项目绑定写入全局 Codex、shell 或用户级配置。",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidPattern.test(binding.project.id)) {
  throw new Error("Invalid Plane project id: " + binding.project.id);
}

const outputPath = resolve(process.cwd(), ".plane-project.json");
writeFileSync(outputPath, JSON.stringify(binding, null, 2) + "\n");
console.log("Wrote " + outputPath);
