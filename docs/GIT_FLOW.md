# Git Flow Protocol — TSUAA

All TSUAA agents **must** follow this protocol. Violations (e.g. `main` ahead of `develop`) are automatically detected and block CI.

## Branch Model

```
main        ─────●────────────────────●── (production)
                  \                  /
develop     ──●────●────●────●────●── (integration)
               \  /      \  /
feature/*    ───●──      ──●──
```

| Branch        | Purpose                         | Source        | Merges into     |
|---------------|---------------------------------|---------------|-----------------|
| `main`        | Production-ready releases       | `develop`     | (none)          |
| `develop`     | Integration branch              | `feature/*`   | `main`          |
| `feature/*`   | New features (short-lived)      | `develop`     | `develop`       |
| `hotfix/*`    | Urgent production fixes         | `main`        | `main` + `develop` |
| `release/*`   | Release preparation             | `develop`     | `main` + `develop` |

## Ground Rules

1. **`main` must NEVER be ahead of `develop`.** If `main` receives a commit (hotfix or direct push), `develop` must be updated immediately via `git merge main`.
2. **All code enters via `develop`.** Feature branches branch off `develop` and merge back into `develop` via PR.
3. **Only release or hotfix merges touch `main`.** No direct commits, no feature PRs targeting `main`.
4. **After merging into `main`, always merge `main` back into `develop`.** This keeps the branches synchronized.
5. **Rebase before merging.** Feature branches should be rebased onto `develop` before merge to keep history linear.

## Verification

Run this to detect violations:

```bash
git log --oneline --left-right main...develop
```

If output shows commits on the `main` side (`<`) that are not on `develop`, the protocol is **violated**.

Fix:

```bash
git checkout develop
git merge main
git push origin develop
```

## CI Enforcement

Add the following check to CI pipelines (GitHub Actions / GitLab CI):

```yaml
check-git-flow:
  steps:
    - run: |
        if [ "$(git rev-list --count main..develop)" -lt 0 ]; then
          echo "ERROR: main is ahead of develop — Git Flow violation"
          exit 1
        fi
    - run: |
        COMMITS=$(git log --oneline --left-right main...develop 2>/dev/null)
        if echo "$COMMITS" | grep -q '^<'; then
          echo "ERROR: main has commits not in develop"
          exit 1
        fi
        echo "Git Flow OK"
```

## Pre-Push Hook (recommended for all agents)

Place this in `.git/hooks/pre-push` on every clone:

```bash
#!/bin/bash
current_branch=$(git symbolic-ref HEAD | sed 's|refs/heads/||')
if [ "$current_branch" = "main" ]; then
  ahead=$(git rev-list --count main..develop)
  if [ "$ahead" -lt 0 ] 2>/dev/null; then
    echo "BLOCKED: main is ahead of develop. Merge main into develop first."
    exit 1
  fi
fi
```

Make it executable: `chmod +x .git/hooks/pre-push`

## Responsibilities

| Role          | Responsibility                                             |
|---------------|------------------------------------------------------------|
| All agents    | Follow branch model; never commit directly to `main`       |
| CTO           | Enforce protocol; audit branches; maintain CI checks       |
| SeniorBackend | Ensure CI Git Flow check runs on every push                |
