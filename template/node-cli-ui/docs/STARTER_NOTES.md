# Node CLI UI starter notes

This starter follows `orgmenv` interaction grammar:

- Persistent `AppShell` with border + ASCII banner + version line.
- One central theme token in `src/interactive/theme.ts`.
- Screen order: title -> keyboard hint -> status -> sections.
- Navigation baseline:
  - `↑/↓`: move
  - `Enter`: confirm
  - `1..N`: quick action
  - `b` or `Esc`: back
  - `Ctrl+C`: exit

Use this scaffold as a starting point and swap only product/domain actions.
