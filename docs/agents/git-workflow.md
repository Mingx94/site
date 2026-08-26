# Git workflow

For tasks that authorize file changes:

1. Run `git status` and preserve existing work.
2. Change and stage only files for the task.
3. Review the diff and run checks that fit the change.
4. Commit on `main` with a short, coherent message.
5. Report the commit hash and validation.

Push, amend, rewrite history, merge a pull request, or enable auto-merge only when the user explicitly asks for that exact action. Never force-push unless the user explicitly asks to rewrite the published history of the specific branch. Report a non-fast-forward rejection instead of forcing.
