# Code Contract

Before passing code to QA, verify ALL requirements below.
If any check fails — re-run Engineer stage, do NOT proceed.

## Input validation:

- [ ] PRD exists and passes its contract
- [ ] Design spec exists and passes its contract
- [ ] STACK.md and CODESTANDARDS.md have been read

## Output MUST contain:

- [ ] All files listed with full paths
- [ ] Every component from design spec is implemented
- [ ] Type definitions for all data structures
- [ ] Error handling for every user-facing action
- [ ] Loading states for every async operation

## Output MUST NOT contain:

- [ ] Hardcoded secrets, API keys, or credentials
- [ ] console.log (use proper logging or remove)
- [ ] TODO / FIXME / HACK comments without linked issue
- [ ] Features not in the PRD (no scope creep)
- [ ] Dead code or commented-out blocks

## Quality checks:

- [ ] Follows naming conventions from CODESTANDARDS.md
- [ ] Uses tech stack from STACK.md (no unauthorized dependencies)
- [ ] Every function has a single responsibility
- [ ] No duplicated logic (DRY)
- [ ] Responsive design matches design spec breakpoints
- [ ] All user-facing text is externalized (i18n-ready)
