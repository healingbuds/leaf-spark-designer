
# Plan: Streamlined Dev Testing Setup ✅ COMPLETED

## Summary

All parts implemented successfully:

1. ✅ **Seed-test-users simplified** - Now only creates admin@healingbuds.test (Admin123!)
2. ✅ **API Environment Toggle** added to DevToolsPanel - Switch between Production and Staging (Railway)
3. ✅ **Quick Login Dropdown** added on Auth page - Admin account for easy testing
4. ⏸️ **Scott & Kayleigh registration** - Pending user input for their details

---

## What Was Implemented

### Part 1: Simplified Seed Test Users
**File:** `supabase/functions/seed-test-users/index.ts`

Removed all test users except admin:
- ✅ admin@healingbuds.test (Admin123!) - Full admin access

### Part 2: API Environment Toggle
**Files Modified:**
- `src/hooks/useApiEnvironment.ts` - New hook for environment state management
- `src/components/DevToolsPanel.tsx` - Added radio group for Production/Staging toggle
- `supabase/functions/drgreen-proxy/index.ts` - Reads `x-api-environment` header and uses appropriate credentials
- `src/lib/drgreenApi.ts` - Includes environment header in all API calls

**How it works:**
1. Toggle in DevToolsPanel saves to localStorage
2. All API calls include `x-api-environment` header
3. Edge function reads header and uses:
   - `production`: `DRGREEN_API_KEY`, `DRGREEN_PRIVATE_KEY`
   - `staging`: `DRGREEN_STAGING_API_KEY`, `DRGREEN_STAGING_PRIVATE_KEY`, `DRGREEN_STAGING_API_URL`

### Part 3: Quick Login Dropdown
**File:** `src/pages/Auth.tsx`

Added collapsible "Dev Quick Login" section (dev-only):
- Visible only in development mode
- Single button to auto-fill admin credentials
- Located below the sign-in button

---

## Admin Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@healingbuds.test | Admin123! | Full admin access |

---

## Next Steps for Scott & Kayleigh

They need to be registered as genuine clients via the Dr Green API with the current keys.

**Options:**
1. **Manual registration** - They can register through `/shop/register` flow
2. **Provide details** - Give me their registration data and I'll create an edge function

Needed details:
1. Full names (first + last)
2. Email addresses
3. Phone numbers (with country code)
4. Shipping addresses (address1, city, state, postal code, country)
5. Date of birth
6. Gender
7. Medical questionnaire responses

