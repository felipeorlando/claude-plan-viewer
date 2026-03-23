# Contributing to Claude Plan Visualizer

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/felipeorlando/claude-plan-visualizer.git
cd claude-plan-visualizer
npm install
```

### Development

Start the Vite dev server with hot reload:

```bash
# Default: looks for .claude/plans in the current directory
npm run dev

# Point to a specific project's plans
npm run dev -- --dir ~/path/to/project

# Point directly to a plans directory
npm run dev -- --dir ~/path/to/project/.claude/plans
```

The `--dir` flag auto-detects `.claude/plans` inside the given path, so pointing to a project root is enough.

You can also use the `PLANS_DIR` environment variable:

```bash
PLANS_DIR=~/path/to/plans npm run dev
```

### Build & Preview

```bash
# Build for production
npm run build

# Preview the production build (uses the CLI server)
npm run preview
```

### Project Structure

```
bin/
  cli.mjs       # Production CLI server (serves built assets + API)
  dev.mjs       # Dev wrapper (passes --dir to Vite via PLANS_DIR env var)
src/
  components/   # React components
  hooks/        # Custom React hooks
  lib/          # Utilities
public/         # Static assets
```

## How to Contribute

### Reporting Bugs

Use the [bug report template](https://github.com/felipeorlando/claude-plan-visualizer/issues/new?template=bug_report.md) to file an issue. Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser/OS/Node version

### Suggesting Features

Use the [feature request template](https://github.com/felipeorlando/claude-plan-visualizer/issues/new?template=feature_request.md) to propose ideas.

### Submitting Code

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Test locally with `npm run dev -- --dir <path-to-plans>`
4. Ensure `npm run build` succeeds
5. Open a pull request

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add dark mode toggle
fix: correct sidebar scroll overflow
docs: update development setup guide
refactor: simplify plans directory resolution
```

## Code Style

- TypeScript for source code, plain JS for CLI scripts (`bin/`)
- Tailwind CSS for styling
- React functional components with hooks
- Keep dependencies minimal

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
