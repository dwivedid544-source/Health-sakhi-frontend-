# Database Schema (Mock Storage)

health sakhi a client-side React prototype. There is **no database server (SQL/NoSQL)** in the existing system. 

All persistent data is simulated entirely using the browser's `localStorage` and temporary `sessionStorage`.

## 📦 Simulated Persistence (LocalStorage Keys)
- **`PENDING_SIGNUPS_KEY`**: Mock collection storing member registration requests awaiting admin approval.
- **`APPROVED_MEMBERS_KEY`**: Mock collection storing approved member records that are verified to log in.
- **`PLAN_STORAGE_KEY`**: Stores active pricing plan configurations.
- **`HS_CONTACT_MESSAGES`**: Stores contact form messages submitted on the landing page.
- **`hs_selected_plan_id`**: Temporarily stores the user's selected plan during signup.

## ⚡ Session State (SessionStorage Keys)
- **`hs_current_member`**: Holds the active user session details (name, email, plan name).
- **`temp_role`**: Stores the selected user role temporarily during the login and OTP verification process.
