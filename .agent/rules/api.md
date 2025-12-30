---
trigger: always_on
---

You are a workflow that keeps all API endpoints organized by HTTP method folders:

- api/v1/GET   → read-only endpoints
- api/v1/POST  → create/write endpoints
- api/v1/PUT   → full updates
- api/v1/PATCH → partial updates
- api/v1/DELETE→ deletions

GENERAL RULES
1. Do NOT put everything in a single GET.js or index.ts.
2. Each endpoint gets its own file (or small folder) inside the matching method folder.
3. Never move code into a different method folder without the user asking (e.g. don’t move POST logic into GET).
4. Preserve existing behavior: same URLs, same methods, same request/response shapes.

FOLDER / FILE STRUCTURE
- All HTTP method folders live under api/v1:
  - api/v1/GET/...
  - api/v1/POST/...
  - api/v1/PUT/...
  - api/v1/PATCH/...
  - api/v1/DELETE/...

- Inside each method folder:
  - Mirror the logical resource path with folders and files.
  - Examples (you can adapt names to match the current project):
    - api/v1/GET/users/list.ts        → GET /api/v1/users
    - api/v1/GET/users/detail.ts      → GET /api/v1/users/:id (or similar)
    - api/v1/POST/users/create.ts     → POST /api/v1/users
    - api/v1/DELETE/users/remove.ts   → DELETE /api/v1/users/:id

- For any new endpoint:
  1. Decide its HTTP method (GET, POST, PUT, PATCH, DELETE).
  2. Go into the corresponding method folder under api/v1.
  3. Create a new file whose path and name describe the resource/operation.
  4. Implement only that endpoint in that file.

IMPLEMENTATION PATTERN
- Each endpoint file exports a single handler function appropriate to the framework, for example:
  - export async function handler(req, res) { ... }
- No file should contain mixed HTTP methods.
- Shared logic (e.g. DB queries, validation) should be put in helper files:
  - api/v1/shared/db.ts
  - api/v1/shared/validation.ts
  and imported where needed, instead of copy-pasting.

BEHAVIOR & SAFETY
- Keep TypeScript types accurate and consistent.
- Validate request bodies and query params.
- Don’t change authentication, authorization, or response formats unless the user explicitly asks.

WHEN THIS WORKFLOW RUNS
1. Identify which HTTP method the user is working on (GET/POST/PUT/PATCH/DELETE).
2. Ensure the corresponding method folder under api/v1 exists; create it if needed.
3. Create or edit a specific endpoint file inside that method folder instead of adding more logic to a single global GET.js.
4. At the end, summarize:
   - Which method folder you used.
   - The exact file path(s) you created/modified.
   - The URL(s) the endpoint handles.