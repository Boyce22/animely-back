# Performance Review Gate — TSUAA

Mandatory performance sign-off before any frontend PR can be merged. Governed by [`.github/workflows/performance-review.yml`](../.github/workflows/performance-review.yml).

## How It Works

### Trigger

The gate runs automatically on every PR opened, synchronized, or reopened targeting `develop` or `main`. It creates a `gate/performance-review` status check on the PR's head commit.

### Detection

The workflow inspects changed files and classifies the PR:

| Classification | Condition | Gate Status |
|---|---|---|
| **Frontend PR** | Any file matching `*.{js,jsx,ts,tsx,css,scss,less,html,svg}` changed | `pending` — requires PerfEngineer review |
| **Non-frontend PR** | No frontend files changed | `success` — auto-skipped |

### Backend PRs (this repo)

This repository (`animely-back`) is primarily a Node.js backend. Most PRs will only touch backend TypeScript files and will auto-skip. However, if frontend assets (e.g., admin UI, dashboard) are ever added, the gate will activate automatically.

### Frontend PR Flow

1. CI detects frontend file changes
2. Project is built (`npm run build`)
3. Bundle size is measured and reported
4. A PR comment is posted with: changed files, bundle size, and review checklist
5. Status is set to `pending` — **merge is blocked**
6. [PerfEngineer](/TSUAA/agents/perfengineer) reviews the PR and:
   - **Approves** → sets status to `success`, PR can merge
   - **Requests changes** → leaves review comments, status stays `pending`

### Non-Frontend PR Flow

1. CI detects no frontend file changes
2. Status is set to `success` immediately
3. No comment is posted
4. PR can merge normally

## Review Criteria

PerfEngineer evaluates each frontend PR against these thresholds:

| Metric | Threshold | Measurement |
|---|---|---|
| Bundle size increase | ≤ +5% | Compared to base branch build |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse / Chrome UX Report |
| INP (Interaction to Next Paint) | < 200ms | Chrome UX Report / field data |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse / Chrome UX Report |

Additional checks:
- No unnecessary re-renders or wasted renders
- Lazy loading / code splitting where applicable
- Tree shaking verified (no unused imports)
- No synchronous blocking code in the render path

## Branch Protection

`gate/performance-review` must be configured as a **required status check** on both `develop` and `main` branches.

### Setup (Repo Admin)

1. Go to **Settings → Branches → Branch protection rules**
2. Add rule for `develop` and `main`
3. Enable **Require status checks to pass before merging**
4. Search for and select **gate/performance-review**

## Override Procedure

If PerfEngineer is unavailable and a frontend PR must be merged urgently:

1. **CTO** must approve the override in the PR comment thread
2. Once approved, the status can be set manually via GitHub CLI:
   ```bash
   gh api repos/{owner}/{repo}/statuses/{sha} \
     -f state=success \
     -f context='gate/performance-review' \
     -f description='Override approved by CTO'
   ```
3. The override and reason must be documented in the PR description

**Overrides are audited.** The CTO reviews all overrides during sprint retrospectives.

## Post-Merge Verification

After a frontend PR is merged and deployed:

1. `deploy.yml` runs a post-deploy performance check
2. If Core Web Vitals regress post-deploy, PerfEngineer is notified
3. A hotfix or revert may be required

## Responsibilities

| Role | Responsibility |
|---|---|
| **PerfEngineer** | Reviews all frontend PRs; sets gate status |
| **CTO** | Approves overrides; configures branch protection |
| **FrontendEngineer** / **JuniorEngineer** | Includes perf impact statement in PR description |
| **SeniorBackend** | Ensures backend PRs don't accidentally touch frontend paths |
