# Engineering

- Check existing dependencies, documentation, and types before you add code.
- Use the simplest design that meets current needs without blocking known requirements.
- Start with the smallest working change. Add a layer only when the task requires it.
- Prefer a mature library when it reduces code or improves stability.
- Remove paths that the task makes obsolete. Keep compatibility paths only when they are required.
- Make complexity justify itself. Remove, inline, rename, or simplify a helper, layer, or special case when its absence causes no concrete problem.
- Evaluate public APIs from the caller's perspective: discoverability, misuse resistance, error semantics, configuration, and evolution.
- Comments must explain non-obvious rationale, invariants, safety constraints, or external quirks. Public API documentation must describe observable contracts.
