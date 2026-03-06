# QA Contract

Before passing QA report to Reviewer, verify ALL requirements below.
If any check fails — re-run QA stage, do NOT proceed.

## Input validation:

- [ ] PRD, design spec, and code all exist
- [ ] Acceptance criteria from PRD are available for testing

## Output MUST contain:

- [ ] Test result for EVERY acceptance criterion from PRD (pass/fail)
- [ ] At least 3 edge case tests
- [ ] At least 2 negative tests (invalid input, unauthorized access, etc.)
- [ ] Bug list with severity (critical / major / minor / cosmetic)
- [ ] Each bug: description, steps to reproduce, expected vs actual
- [ ] Overall verdict: PASS / FAIL / PASS WITH NOTES

## Output MUST NOT contain:

- [ ] Code fixes (only describe the problem, Engineer fixes)
- [ ] New feature suggestions (out of scope for QA)
- [ ] Untested acceptance criteria (every one must have a result)

## Quality checks:

- [ ] Every acceptance criterion has explicit pass/fail
- [ ] Critical bugs → automatic FAIL verdict
- [ ] Bug descriptions are reproducible (not vague "doesn't work")
- [ ] Tests cover: happy path, edge cases, error cases, responsive
