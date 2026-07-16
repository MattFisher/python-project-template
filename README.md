# python-project-template

A [Copier](https://copier.readthedocs.io/) template for MattFisher's Python
projects, plus the shared reusable CI workflow they all call. It encodes one
standard so the repos don't drift:

- **uv** for dependency management (`uv sync`, `uv run`), pinned Python via
  `.python-version`
- **hatchling** build backend for libraries; apps stay `package = false`
- **pre-commit** stack: ruff (lint + format), [zizmor](https://docs.zizmor.sh/)
  (Actions security), mdformat — plus **mypy** (always) and **pytest**
- Shared **`python-ci`** reusable workflow (`uv sync` → mypy → pytest →
  pre-commit), so every repo's CI is a three-line caller
- **Keep a Changelog** `CHANGELOG.md`; libraries also get PyPI trusted
  publishing (`publish.yml` + `RELEASING.md`)
- A Claude Code `SessionStart` hook that pre-warms the toolchain

## Scaffold a new project

```bash
uvx copier copy gh:MattFisher/python-project-template my-new-project
```

You'll be asked for the name, description, whether it's an app or a library,
Python version, and whether to enable a coverage gate.

## Update an existing project when the template changes

From inside a project that was generated from this template (it has a
`.copier-answers.yml`):

```bash
uvx copier update
```

Copier does a 3-way merge between the old template output, the new output, and
your local edits — so you get template improvements without losing your
customizations.

## The reusable CI workflow

Generated projects call
[`.github/workflows/python-ci.yml`](.github/workflows/python-ci.yml) rather than
duplicating CI. To bump CI for every repo at once, change it here and move the
`v1` tag.

```yaml
jobs:
  ci:
    uses: MattFisher/python-project-template/.github/workflows/python-ci.yml@v1
    with:
      python-version: "3.12"
```

## Versioning

Tagged `v1.0.0` with a moving `v1`. Generated projects pin the reusable workflow
to `@v1`; a repo-local `.github/zizmor.yml` allows tag-pinned refs from
`MattFisher/*` while still requiring commit-SHA pins for third-party actions.
