# Specification

## Summary
**Goal:** Pre-authorize a specific principal as an initial admin in the WRAITH backend so they have admin access immediately upon deployment.

**Planned changes:**
- Hardcode principal `tppp7-aedx6-t5lmu-6qnik-e46l6-jbsl2-jmt6r-dhupo-bkdih-s2avm-zqe` into the initial admin list in `backend/main.mo`, alongside any existing initial admins.

**User-visible outcome:** The specified principal has admin access immediately after deployment without any manual setup, and all existing admin functionality continues to work as before.
