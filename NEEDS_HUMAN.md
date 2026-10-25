# Needs Human Action Log

Items requiring manual action or human intervention outside automated script control.

| Date | Category | Item | Fallback / Current Status | Action Required |
|---|---|---|---|---|
| 2026-10-26 | Video / Grading | Motion Studies Video Post-Production | Playwright + ffmpeg captured raw 8.6s MP4 (`site/projects/motion-studies/motion-study.mp4`) | Color grade/edit in DaVinci Resolve is a manual step for the author. No Resolve work claimed by AI. |
| 2026-10-26 | Design | `design/figma-tokens.json` not provided | `design/tokens.json` built with frosted-glass spatial tokens; `design/FIGMA_TODO.md` logged | Human Figma pass pending for brand & design tokens |
| 2026-10-26 | CLI Tools | `claude` CLI not logged in (`Not logged in · Please run /login`) | Orchestrator architecture synthesis fallback used for `agents/claude/` | Run `claude /login` interactively when ready |
| 2026-10-26 | CLI Tools | `gemini` standalone CLI not found in PATH | Native Gemini 3.8 orchestrator synthesis used for `agents/gemini/` | Optional: install standalone CLI |
| 2026-10-26 | CLI Tools | `codex` / `chatgpt` CLI not found in PATH | Structured specialist agent synthesis used for `agents/gpt/` | Optional: install codex CLI |
| 2026-10-26 | CV | Local LaTeX compiler (`pdflatex`/`tectonic`) | Print-styled HTML rendered to PDF via Playwright; `cv/main.tex` prepared for Overleaf | Overleaf compilation optional |
