# API Architecture (Mock Routing & Logic)

health sakhi is a client-side React prototype. There is **no backend server or API (REST/GraphQL)** in the existing system.

All network-like behaviors, request routing, and CRUD simulations are executed entirely in the browser.

## Client-Side Operations

### 1. Simulated Endpoint Logic (`src/data/memberOnboarding.js`)
Frontend helpers act as mock API controllers to manage mock database updates:
- **`readJsonArray(key)`**: Simulates a database query by fetching data from `localStorage`.
- **`writeJsonArray(key, data)`**: Simulates a write command by saving records to `localStorage`.
- **`getApprovedMembers()`**: Seeds mock credentials if the local storage collections are empty.

### 2. Mock Authenticator (Login / Registration)
- **Login Verification:** Validates user credentials on `/login` by comparing inputs directly against the `APPROVED_MEMBERS` local storage array or hardcoded demo accounts configuration.
- **Registration Submission:** Intercepts signup form submissions, verifies email uniqueness locally, and adds requests to the pending signup array in browser storage.
