# Testing

- Add tests for realistic observable regressions, non-trivial invariants or boundaries, and concrete bugs.
- Prefer existing coverage at the behavior boundary.
- Do not add tests that mirror literals, mappings, obvious control flow, implementation details, or removed features unless absence is a contract.
- For concurrency, prefer deterministic coordination or controlled scheduling over sleeps.
