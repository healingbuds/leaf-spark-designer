
# Plan: Streamlined Dev Testing Setup

## Summary

1. **Clean up seed-test-users** - Keep ONLY admin user, remove all other test accounts
2. **Add API Environment Toggle** to DevToolsPanel - Switch between Production and Staging (Railway)
3. **Add Quick Login Dropdown** on Auth page - Single admin account for easy testing
4. **Create client re-registration endpoint** - For re-registering Scott and Kayleigh via Dr Green API with current key

---

## Part 1: Simplify Seed Test Users

**File:** `supabase/functions/seed-test-users/index.ts`

Remove all test users EXCEPT admin:

```text
BEFORE (6 users):
- new@healingbuds.test
- pending@healingbuds.test
- kycdone@healingbuds.test
- patient@healingbuds.test
- rejected@healingbuds.test
- admin@healingbuds.test

AFTER (1 user):
- admin@healingbuds.test (Admin123!)
```

The admin account will have:
- Full admin role
- Verified client status
- Access to admin dashboard

---

## Part 2: API Environment Toggle

**File:** `src/components/DevToolsPanel.tsx`

Add environment selector with two options:
- **Production** - api.drgreennft.com (DRGREEN_API_KEY)
- **Staging** - Railway backend (DRGREEN_STAGING_API_KEY)

Visual design:
```text
+----------------------------------+
| DevTools                    [DEV]|
+----------------------------------+
| API Environment                  |
|  ○ Production                    |
|  ● Staging (Railway)             |
|                                  |
| Status: STAGING                  |
+----------------------------------+
```

**File:** `src/hooks/useApiEnvironment.ts` (new)

Create hook to manage environment state:
- Read/write to localStorage (`drgreen_api_environment`)
- Default: `production`
- Export helper to get current environment

**File:** `supabase/functions/drgreen-proxy/index.ts`

Update to check `x-api-environment` header:
- If `staging`: Use DRGREEN_STAGING_* secrets
- If `production` (default): Use DRGREEN_* secrets

**File:** `src/lib/drgreenApi.ts`

Include environment header in all API calls:
```typescript
headers: {
  'x-api-environment': localStorage.getItem('drgreen_api_environment') || 'production'
}
```

---

## Part 3: Quick Login Dropdown

**File:** `src/pages/Auth.tsx`

Add collapsible dev-only section below login form:

```text
+----------------------------------+
|        [Login Form]              |
+----------------------------------+
|                                  |
| 🧪 Dev Login                 [▼] |
+----------------------------------+
| [ Select account...           ▼] |
|   └─ admin@healingbuds.test      |
+----------------------------------+
```

Behavior:
- Only visible when `import.meta.env.DEV` or on lovable domains
- Selecting admin auto-fills email and password
- Uses existing Select component

---

## Part 4: Re-register Scott and Kayleigh

**Question for you:** To register Scott and Kayleigh as genuine clients under your current API key, I need their registration details:

1. **Full names** (first + last)
2. **Email addresses** 
3. **Phone numbers** (with country code)
4. **Shipping addresses** (address1, city, state, postal code, country)
5. **Date of birth**
6. **Gender**
7. **Medical questionnaire responses** (or they can complete the /shop/register flow themselves)

**Option A:** Provide me the details and I'll create an edge function to register them
**Option B:** They can register themselves through the normal ClientOnboarding flow at /shop/register

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/seed-test-users/index.ts` | Keep only admin user |
| `src/components/DevToolsPanel.tsx` | Add API environment radio group |
| `src/hooks/useApiEnvironment.ts` | New hook for environment state |
| `src/pages/Auth.tsx` | Add quick login dropdown (admin only) |
| `supabase/functions/drgreen-proxy/index.ts` | Support `x-api-environment` header |
| `src/lib/drgreenApi.ts` | Include environment header |

---

## Technical Flow

```text
DevToolsPanel
    │
    ├─► localStorage['drgreen_api_environment'] = 'staging'
    │
Auth Page (Quick Login)
    │
    ├─► Auto-fill: admin@healingbuds.test / Admin123!
    │
API Request (drgreenApi.ts)
    │
    ├─► Header: x-api-environment: staging
    │
drgreen-proxy Edge Function
    │
    ├─► If staging:
    │     URL: DRGREEN_STAGING_API_URL
    │     Key: DRGREEN_STAGING_API_KEY
    │     Secret: DRGREEN_STAGING_PRIVATE_KEY
    │
    └─► If production:
          URL: https://api.drgreennft.com/api/v1
          Key: DRGREEN_API_KEY
          Secret: DRGREEN_PRIVATE_KEY
```

---

## Admin Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@healingbuds.test | Admin123! | Full admin access |
