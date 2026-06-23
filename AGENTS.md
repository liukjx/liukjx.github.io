# Repository Guidelines

## Project Structure & Module Organization

This repository publishes a Quartz-based blog to GitHub Pages. Author content lives in `content/`; `content/index.md` is the home page and subfolders group notes by topic. Root-level `quartz.config.ts` and `quartz.layout.ts` are the site customizations copied into `quartz/` during builds. `scripts/` contains post-processing utilities for ABC notation, Three.js blocks, and Anime.js blocks. `quartz/` is the Quartz app/submodule workspace, with framework code under `quartz/quartz/`, tests under `quartz/quartz/**/*.test.ts`, and generated output in `quartz/public/`.

## Build, Test, and Development Commands

- `cd quartz && npm ci`: install Quartz dependencies from `package-lock.json`.
- `./build.sh`: run the full local production pipeline, including config copy, ABC preprocessing, Quartz build, and post-build injections.
- `cd quartz && npx quartz build -d ../content --serve`: preview content locally; use this for writing feedback, but remember it does not run every custom post-build step from `build.sh`.
- `cd quartz && npm test`: run Quartz TypeScript tests with `tsx --test`.
- `cd quartz && npm run check`: run `tsc --noEmit` and Prettier checks.
- `cd quartz && npm run format`: apply Prettier formatting inside the Quartz workspace.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, final newline, trimmed trailing whitespace, two spaces for Markdown, JSON, YAML, TOML, and TypeScript; four spaces otherwise. Keep Markdown filenames descriptive and topic-oriented, matching existing Chinese note names where appropriate. Use kebab-case or clear descriptive names for scripts, and keep generated files out of commits unless they are intentionally published assets.

## Testing Guidelines

Run `npm test` and `npm run check` from `quartz/` when changing Quartz code, config, or TypeScript. For build-pipeline changes, run `./build.sh` and inspect `quartz/public/`. Name new tests `*.test.ts` near the code they validate, matching existing examples such as `quartz/quartz/util/path.test.ts`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit prefixes such as `feat:`, `fix:`, and `perf:`. Keep commits focused, for example `fix: process anime stagger delays`. Pull requests should describe the user-visible change, list the commands run, and include screenshots or the affected page URL for visual blog changes. Link related issues when available.

## Deployment & Configuration Notes

GitHub Actions deploys pushes to `main`. The workflow copies root config and `content/` into `quartz/`, installs dependencies, builds, then runs the custom processors. Do not edit only `quartz/content/` for lasting content changes; update root `content/` instead.
