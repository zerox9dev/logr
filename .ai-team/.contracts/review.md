# Review Contract

Final quality gate. Before marking task as DONE, verify ALL requirements below.
If any check fails — send back to the specific stage with clear feedback.

## Input validation:

- [ ] All previous stages exist: PRD, design, code, QA report
- [ ] QA verdict is PASS or PASS WITH NOTES (not FAIL)

## Output MUST contain:

- [ ] Checklist: each previous contract verified (PRD ✓, Design ✓, Code ✓, QA ✓)
- [ ] Code quality assessment (1-5 scale with justification)
- [ ] Design fidelity assessment (does code match design spec?)
- [ ] PRD completeness assessment (does final result match requirements?)
- [ ] List of improvements for next iteration (nice-to-haves, not blockers)
- [ ] Final verdict: APPROVED / NEEDS REWORK / REJECTED

## Rework rules:

- [ ] If NEEDS REWORK: specify exactly which stage to re-run and what to fix
- [ ] Max 3 rework cycles per task — after that, escalate to operator
- [ ] Never re-run ALL stages — only the one that needs fixing

## Quality checks:

- [ ] No critical QA bugs remain open
- [ ] Code follows all standards from CODESTANDARDS.md
- [ ] No scope creep (features match PRD, nothing added)
- [ ] All contracts from previous stages are satisfied
