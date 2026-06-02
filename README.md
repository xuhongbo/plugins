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

## 最快安装方式

如果你已经在 Codex 或 Claude Code 里，可以直接把对应的话发给 AI。

Codex：

> 帮我安装 Ledu Plane 插件。插件市场地址是 `https://github.com/xuhongbo/plugins`，插件名是 `plane`。安装后确认内置 Plane MCP server 已注册，并提醒我配置 `PLANE_ACCESS_TOKEN`。不要创建或修改仓库级 Plane 项目绑定，除非我确认。

Claude Code：

> 帮我安装 Ledu Plane 插件。插件市场地址是 `https://github.com/xuhongbo/plugins`，安装项是 `plane@ledu-plane`。安装后执行 `/reload-plugins`，确认内置 Plane MCP server 已注册，并提醒我配置 `PLANE_ACCESS_TOKEN`。不要创建或修改仓库级 Plane 项目绑定，除非我确认。

如果当前 AI 没有插件管理权限，或者你想手动安装，再使用下面的命令。

## 前置条件

- Codex 或 Claude Code 已支持插件功能。
- 运行插件的机器上可用 `uv`。
- 一个可访问 `ledu` workspace 的 Plane Personal Access Token。

不要提交 `PLANE_ACCESS_TOKEN`。请把它配置在本地 agent 环境或插件授权界面中。

## Codex 手动安装

注册这个仓库作为 Codex marketplace：

    codex plugin marketplace add https://github.com/xuhongbo/plugins

然后在 Codex 插件界面或插件命令流程里，从 `Ledu Plane` marketplace 安装 `plane`。

安装后，为 Codex 配置本地 `PLANE_ACCESS_TOKEN`，然后重启或重新启用插件，让内置 MCP server 正常启动。

## Claude Code 手动安装

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

当前仓库的 Plane 项目绑定保存在 `.plane-project.json`。这个绑定只属于当前仓库；不要复制到全局 Codex、Claude、shell 或用户级配置。

生成绑定文件：

    node scripts/write-plane-project-binding.mjs

插件固定使用 workspace slug：`ledu`。脚本不会询问或允许修改 workspace，只会以一问一答的形式让用户填写项目绑定：

- project id
- project name
- project identifier

也可以显式传参生成：

    node scripts/write-plane-project-binding.mjs \
      --project-id <uuid> \
      --project-name <name> \
      --project-identifier <identifier>

当用户要求插件调用 Plane MCP 做项目级操作时，agent 必须先确定具体 project id：优先使用用户明确提供的 project id 或 repo-local 绑定；如果没有绑定，就验证用户提供的 Plane 链接，或列出项目让用户选择。agent 应从 Plane 查询结果自动补全 project name 和 project identifier，而不是让用户手填这些关联信息。保存 repo-local 绑定前必须先征求用户确认。
