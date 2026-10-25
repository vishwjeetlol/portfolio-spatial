# Tooling Inventory & Environment Status

Generated: October 26, 2026
Host: macOS arm64, zsh

## Tool Status Matrix

| Tool | Version / Path | Auth / Operational Status | Notes / Working Invocations |
|---|---|---|---|
| **OS / Shell** | macOS arm64, zsh | Operational | `shasum -a 256`, `sed -i ''`, `xxd` |
| **Git** | 2.50.1 (Apple Git-155) | Operational | Git version control |
| **Node.js** | v24.22.0 | Operational | Runtime engine |
| **npm** | 11.19.1 | Operational | Package management |
| **GitHub CLI (`gh`)** | 2.89.0 | Authenticated as `vishwjeetlol` | Protocol: https, active account |
| **Vercel CLI** | 65.2.0 | Authenticated as `vishwjeetchavan123-9223` | Active team: Hobby plan |
| **Python** | 3.14.5 | Operational | Python 3 environment |
| **Blender** | 5.4.0 Alpha (`/Applications/Blender.app/Contents/MacOS/Blender`) | Operational | Headless execution: `/Applications/Blender.app/Contents/MacOS/Blender -b -P <script>` |
| **Claude CLI (`claude`)** | 2.1.299 (Claude Code) (`/Users/vishwjeetchavan/.local/bin/claude`) | Operational | Invocation: `claude -p` |
| **Gemini CLI** | Not found in PATH | Fallback Active | Native orchestrator (Gemini 3.8) synthesis via `agents/gemini/` |
| **Codex CLI** | Not found in PATH | Fallback Active | Specialized orchestrator synthesis via `agents/gpt/` |
| **Playwright / Chromium** | Playwright installed via `npm` | Operational | Headless verification & screenshot engine |
