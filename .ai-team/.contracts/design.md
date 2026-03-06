# Design Contract

Before passing design spec to the next agent, verify ALL requirements below.
If any check fails — re-run Designer stage, do NOT proceed.

## Input validation:

- [ ] PRD exists and passes its own contract
- [ ] All user stories from PRD are addressed in the design

## Output MUST contain:

- [ ] User flow (step-by-step, numbered, from entry to completion)
- [ ] Component list with names and descriptions
- [ ] States for each component (default, loading, success, error, empty)
- [ ] Responsive behavior (desktop + mobile at minimum)
- [ ] Edge cases (at least 3: empty state, error, overflow, etc.)

## Output MUST NOT contain:

- [ ] Working code or pseudo-code
- [ ] API endpoints or database queries
- [ ] Specific CSS values (use design tokens from STYLEGUIDE.md)
- [ ] New requirements not in the PRD (flag them as suggestions instead)

## Quality checks:

- [ ] Every user story from PRD has a corresponding UI flow
- [ ] No component exists without defined states
- [ ] Mobile experience is not an afterthought (explicitly designed)
- [ ] Accessibility considered (keyboard nav, screen reader, contrast)
