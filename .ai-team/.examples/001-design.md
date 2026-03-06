# Design: Natural Language Time Entry

## User Flow
1. User sees input field with placeholder "Type: 2h design for Acme..."
2. User types natural language phrase
3. Presses Enter or clicks Parse
4. Preview card appears below with parsed data
5. User reviews: duration, client, project, description
6. Clicks "Save" to confirm or edits fields inline
7. Time entry created, input clears, success toast

## Components

### SmartInput
- Large text input, full width, prominent placement
- Placeholder: "2h design for Acme..." (rotates examples)
- Icon: sparkle ✨ on the left (signals AI)
- Submit: Enter key or button on the right
- States:
  - **Default:** empty input with placeholder
  - **Typing:** input has text, no preview yet
  - **Loading:** subtle shimmer in preview area
  - **Parsed:** preview card visible below
  - **Error:** red text "Couldn't parse, try again"

### ParsePreview
- Card below input showing parsed result
- Fields displayed as editable chips/tags:
  - ⏱ Duration: "2h" (editable)
  - 👤 Client: "Acme" (dropdown to existing clients)
  - 📁 Project: "Website Redesign" (dropdown to existing projects)
  - 📝 Description: "design" (editable text)
- If client/project not found: yellow chip "New — Acme" with option to create
- Two buttons: "Save" (primary) and "Cancel" (ghost)

### After Save
- Input clears
- Toast: "✅ 2h logged for Acme"
- New entry appears in today's time list

## Responsive
- Desktop: input + preview side by side or stacked
- Mobile: full width stacked, large touch targets on chips

## Edge Cases
- Empty input → nothing happens
- Unparseable input → "I couldn't understand that. Try: 2h design for Acme"
- No duration found → ask "How long did this take?"
- Multiple possible clients → show dropdown to pick
- Very long description → truncate in preview, full text in entry
