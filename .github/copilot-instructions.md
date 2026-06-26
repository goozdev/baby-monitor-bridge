# Copilot Agent Instructions

## Version number

Whenever you make any code change to this repository, update the version string in **`index.html`** in two places:

1. The `APP_VERSION` constant (inside the `<script>` block):
   ```js
   const APP_VERSION = 'v{YYYY-MM-DD} · {short-commit-sha}';
   ```
2. The static fallback in the debug-footer `<span>`:
   ```html
   <span class="version-label" id="version-label">v{YYYY-MM-DD} · {short-commit-sha}</span>
   ```

Use today's date (`YYYY-MM-DD`) and the first 7 characters of the resulting commit SHA.  
If the exact SHA is not yet known at edit time, use the date only and leave a placeholder (e.g. `·0000000`) — the important thing is that the date is always current.
