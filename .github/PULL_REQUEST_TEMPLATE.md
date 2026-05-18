## Description

<!-- Describe what this PR does and why. -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Documentation
- [ ] CI/CD
- [ ] Other: <!-- describe -->

## Performance Impact Statement

<!-- REQUIRED for all PRs. PerfEngineer reviews this section. -->

- **Bundle size impact:** <!-- e.g., +12 KB (+2%), No change, N/A (backend) -->
- **Query / API impact:** <!-- e.g., New index added, N+1 query fixed, New endpoint (GET /api/...), No DB changes -->
- **Connection pool risk:** <!-- e.g., None, New parallel queries added -->
- **Caching strategy:** <!-- e.g., Redis TTL 300s, Response cache header, N/A -->

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests run (API)
- [ ] Migration tested (if applicable)
- [ ] Profiling reviewed (query plans, flamegraph)

## Checklist

- [ ] Code follows project conventions
- [ ] No console.log or debug code left in
- [ ] No N+1 queries introduced
- [ ] New dependencies justified
- [ ] This PR follows [Git Flow](../../docs/GIT_FLOW.md) — targeting correct branch

---

**PerfEngineer review required for frontend changes.**
See [PERFORMANCE_GATE.md](docs/PERFORMANCE_GATE.md) for review criteria.
