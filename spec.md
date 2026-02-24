# Specification

## Summary
**Goal:** Replace the principal-based admin authentication system with a simple password-based system using the passphrase "WRAITH123".

**Planned changes:**
- Add a `verifyAdminPassword(password: Text) : async Bool` function to the backend that returns true when the input matches "WRAITH123"
- Remove principal-based `isAdmin(caller)` checks from admin authorization; retain `getAdminList`, `addAdmin`, and `removeAdmin` functions gated by password verification instead
- Replace the Internet Identity login requirement on the `/admin` route with a styled password entry screen matching the WRAITH dark classified-ops theme (near-black background, amber/red accents, monospaced typography)
- On correct password entry, call `verifyAdminPassword` and grant access to the AdminPanelContent component for the session
- On incorrect password entry, display a styled "ACCESS DENIED — INVALID PASSPHRASE" error message

**User-visible outcome:** Users can access the admin panel at `/admin` by entering the passphrase "WRAITH123" without needing to log in via Internet Identity. Incorrect passwords show a styled denial message.
