# python-project-template

A [Copier](https://copier.readthedocs.io/) template for MattFisher's Python
projects, plus the shared reusable CI workflow they all call. It encodes one
standard so the repos don't drift:

- **uv** for dependency management (`uv sync`, `uv run`), pinned Python via
  `.python-version`
- **hatchling** build backend for libraries; apps stay `package = false`
- **pre-commit** stack: ruff (lint + format), [zizmor](https://docs.zizmor.sh/)
  (Actions security), mdformat, optionally typos — plus **mypy** (always) and
  **pytest**
- Shared **`python-ci`** reusable workflow (`uv sync` → mypy → pytest →
  pre-commit), so every repo's CI is a three-line caller
- Optional TypeScript/JavaScript side: **Biome** (lint + format) in the
  pre-commit stack, plus a shared **`node-ci`** workflow for type-check and
  build
- **Keep a Changelog** `CHANGELOG.md`; libraries also get PyPI trusted
  publishing (`publish.yml` + `RELEASING.md`)
- A Claude Code `SessionStart` hook that pre-warms the toolchain

## Scaffold a new project

```bash
uvx copier copy gh:MattFisher/python-project-template my-new-project
```

You'll be asked for the name, description, whether it's an app or a library,
Python version, whether to enable a coverage gate, whether the project has a
TypeScript/JavaScript frontend, and whether to run the typos spell-checker.

### Turning off `typos`

Answer no to `use_typos` and the hook is left out of the generated
`.pre-commit-config.yaml`. Worth doing for projects whose vocabulary the
checker doesn't know — medical, legal or scientific terms, non-English proper
nouns — or that commit generated data such as serialised fixtures and
extraction output.

Note the hook is configured **report-only**, with `args: [--force-exclude]`.
Its own defaults are `[--write-changes, --force-exclude]`, which edit files
rather than reporting: on the wrong corpus that means silent, incorrect
rewrites. In one repo it renamed `Miliary` (as in miliary tuberculosis) to
`Military`, `PASH` to `HASH`, and every `...Ser` serializer class to `...Set`,
alongside ~900 edits inside hex digests — all committed before anyone noticed.
A spelling correction should need a human to approve it, so the template drops
`--write-changes`. Add it back per-project if you want the autofix.

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

### The TypeScript side

Answer yes to `use_frontend` and the scaffold also gets `biome.json`, a Biome
hook in the pre-commit stack, and a second CI job calling
[`node-ci.yml`](.github/workflows/node-ci.yml):

```yaml
  frontend:
    uses: MattFisher/python-project-template/.github/workflows/node-ci.yml@v1
    with:
      working-directory: "frontend"
```

`working-directory` is the point of the input: it defaults to the repo root
for a standalone package, and takes a subdirectory for a hybrid repo (a Django
app at the root with a Vite frontend under `frontend/`). `node-ci` also accepts
`node-version`, `package-manager` (yarn/npm/pnpm — it runs `corepack enable`,
so Yarn Berry and pnpm pin themselves through `packageManager` in
package.json), and `run-build`.

Note what `node-ci` does *not* do: lint and format. Biome runs as a pre-commit
hook, and `python-ci` already runs the whole pre-commit stack, so a hybrid repo
gets TS lint/format without paying for a second Node job. `node-ci` covers only
the parts that need the project's own dependencies installed.

`biome.json` excludes `.yarn/**`. Yarn Berry projects commit `.yarn/sdks` and
`.yarn/releases` (their `.gitignore` un-ignores them), so `useIgnoreFile`
alone doesn't keep Biome out of Yarn's own vendored code — without the
exclusion it reformats those files. Add your own exclusions there for any
generated data the project commits, such as serialised test fixtures.

Biome is chosen for the same reason as ruff on the Python side — one fast Rust
binary doing both jobs, one config file, no plugin ecosystem to keep in sync.
The trade-off is that it has no type-aware linting; rules like
`no-floating-promises` need typescript-eslint. `tsc --noEmit` under `strict`
covers most of that ground.

## Keeping projects up to date

Scaffolded projects get a `template-update.yml` workflow that runs
`copier update` weekly (and on demand) and opens a PR when the template's
*scaffolded files* have changed. Copier does a three-way merge between the old
template output, the new output, and the project's local edits, so
customisations survive.

Two things worth knowing about the scope:

- **Reusable workflow changes need no update run.** Consumers pin
  `python-ci.yml@v1` and `node-ci.yml@v1`, so moving the `v1` tag propagates
  those immediately. The update workflow exists only for the copied files —
  `.pre-commit-config.yaml`, `biome.json`, `pyproject.toml` and friends.
- **It requires `.copier-answers.yml`.** A project adapted by hand rather than
  scaffolded has no baseline for copier to merge from, and the workflow fails
  with a message saying so. Adopt the template properly first.

Where copier's merge conflicts it leaves ordinary conflict markers and labels
the PR. Setting `resolve-conflicts-with-claude: true` (plus an
`ANTHROPIC_API_KEY` secret) has the Claude Code action attempt them instead.
It's off by default: copier's merge is deterministic and usually clean, and a
conflict is often exactly the thing a human should look at.

One GitHub quirk the PR body also mentions: it's opened with the default
`GITHUB_TOKEN`, and GitHub deliberately does not run workflows on PRs created
that way. Close and reopen the PR, or push a commit to it, to get CI to run —
or swap in a PAT or GitHub App token if you want that automatic.

## Versioning

Tagged `v1.0.0` with a moving `v1`. Generated projects pin the reusable workflow
to `@v1`; a repo-local `.github/zizmor.yml` allows tag-pinned refs from
`MattFisher/*` while still requiring commit-SHA pins for third-party actions.
