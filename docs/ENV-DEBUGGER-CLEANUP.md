# EnvDebugger Sanitization Checklist

**Status:** 🔴 TEMPORARY COMPONENT - MUST REMOVE BEFORE PRODUCTION

## Overview

The `EnvDebugger` component was added to validate environment variables during the Vite → Next.js migration. It must be completely removed before any production deployment.

---

## Pre-Removal Verification

Before removing, confirm the following are working correctly:

- [ ] All environment variables display as expected (green = present)
- [ ] `VITE_SUPABASE_URL` is accessible and ping test returns "Connection OK"
- [ ] `VITE_SUPABASE_PROJECT_ID` matches the expected project
- [ ] No `[MISSING]` or `[EMPTY]` values for required variables
- [ ] Application functions correctly with the debugger present

---

## Removal Checklist

### Step 1: Remove from App.tsx

**File:** `src/App.tsx`

- [ ] Remove the import statement:
  ```typescript
  // DELETE THIS LINE:
  import EnvDebugger from './components/EnvDebugger';
  ```

- [ ] Remove the component usage:
  ```typescript
  // DELETE THIS LINE:
  <EnvDebugger />
  ```

### Step 2: Delete the Component File

**File:** `src/components/EnvDebugger.tsx`

- [ ] Delete the entire file from the repository
- [ ] Verify no other files import `EnvDebugger`

### Step 3: Delete This Checklist (Optional)

**File:** `docs/ENV-DEBUGGER-CLEANUP.md`

- [ ] Delete this checklist once cleanup is complete

---

## Verification Commands

After removal, verify the build succeeds:

```bash
# Check for any remaining references
grep -r "EnvDebugger" src/

# Build the project
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Files to Delete

| File | Purpose | Status |
|------|---------|--------|
| `src/components/EnvDebugger.tsx` | Temporary debug component | ⏳ Pending removal |
| `docs/ENV-DEBUGGER-CLEANUP.md` | This checklist | ⏳ Delete after cleanup |

---

## Security Reminder

⚠️ **CRITICAL:** The EnvDebugger component exposes environment variable names and partial values in the browser. While it doesn't expose secrets (those are server-side only), it should **never** be deployed to production as it:

1. Reveals internal configuration details
2. Shows API endpoints publicly
3. Could assist attackers in reconnaissance

---

## Timeline

| Action | Date | Completed |
|--------|------|-----------|
| Component created | $(date) | ✅ |
| Migration validated | | ⬜ |
| Component removed | | ⬜ |
| Production deployed | | ⬜ |

---

**Assigned to:** Development Team  
**Priority:** HIGH - Block production deploy until complete
