# Ledu Plane 插件市场

[English documentation](./README.en.md)

这个仓库是面向 Codex 和 Claude Code 的 Plane 插件市场。

仓库地址：

    https://github.com/xuhongbo/plugins

插件本体位于 `plugins/plane/`，包含 Plane MCP server 以及 Codex、Claude Code 两套插件声明：

- Codex：`plugins/plane/.codex-plugin/plugin.json`
- Claude Code：`plugins/plane/.claude-plugin/plugin.json`
- MCP server 配置：`plugins/plane/.mcp.json`
- Plane 工作流 skill：`plugins/plane/skills/plane/SKILL.md`

插件默认连接 `https://plane.ledupeiyou.com`，workspace slug 为 `ledu`。用户只需要提供 `PLANE_ACCESS_TOKEN`。

## 前置条件

- Codex 或 Claude Code 已支持插件功能。
- 运行插件的机器上可用 `uv`。
- 一个可访问 `ledu` workspace 的 Plane Personal Access Token。

不要提交 `PLANE_ACCESS_TOKEN`。请把它配置在本地 agent 环境或插件授权界面中。

## 在 Codex 中安装

注册这个仓库作为 Codex marketplace：

    codex plugin marketplace add https://github.com/xuhongbo/plugins

然后在 Codex 插件界面或插件命令流程里，从 `Ledu Plane` marketplace 安装 `plane`。

安装后，为 Codex 配置本地 `PLANE_ACCESS_TOKEN`，然后重启或重新启用插件，让内置 MCP server 正常启动。

## 在 Claude Code 中安装

在 Claude Code 交互会话中注册这个仓库作为 marketplace：

    /plugin marketplace add https://github.com/xuhongbo/plugins

然后安装插件：

    /plugin install plane@ledu-plane
    /reload-plugins

等价的终端 CLI 命令是：

    claude plugin marketplace add https://github.com/xuhongbo/plugins
    claude plugin install plane@ledu-plane

安装后，在 Claude Code 环境或插件授权界面配置 `PLANE_ACCESS_TOKEN`。插件还提供 Claude 命令：

    /plane <task>

这个命令遵循与 Codex skill 相同的 project id 和 read-before-write 规则。

## 仓库级 Plane 项目绑定

当前仓库的默认 Plane 项目绑定保存在 `.plane-project.json`。这个绑定只属于当前仓库；不要复制到全局 Codex、Claude、shell 或用户级配置。

当前默认绑定：

- `workspace_slug`：`ledu`
- project id：`2ff67848-d1d2-4b41-bc47-6c975294c479`
- project name：`plane_feature`
- project identifier：`PF`

重新生成绑定文件：

    node scripts/write-plane-project-binding.mjs

当用户要求插件调用 Plane MCP 做项目级操作时，agent 必须使用用户明确提供的 project id，或先读取这个 repo-local 绑定。
