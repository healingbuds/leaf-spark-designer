
# Visual Edits Implementation Plan ✅ COMPLETE

## Summary
Three sets of changes to clean up the codebase and improve user experience:

1. ✅ **Remove Test Accounts dropdown** from Auth page
2. ✅ **Rename "Cultivar" to "Strain"** globally
3. ✅ **Dynamic CTAs** on homepage based on eligibility

---

## Part 1: Remove Test Accounts Dropdown ✅

### File: `src/pages/Auth.tsx`
**Action:** Deleted lines 294-398 (the "Test Accounts (Demo Access)" dropdown block)

---

## Part 2: Rename "Cultivar" to "Strain" ✅

### File Renames
| Old File | New File | Status |
|----------|----------|--------|
| `src/pages/CultivarDetail.tsx` | `src/pages/StrainDetail.tsx` | ✅ |
| `src/components/shop/CultivarQuickView.tsx` | `src/components/shop/StrainQuickView.tsx` | ✅ |

### Code Updates

| File | Changes | Status |
|------|---------|--------|
| `src/App.tsx` | Updated import to `StrainDetail`, changed route to `/shop/strain/:strainId` | ✅ |
| `src/components/shop/ProductCard.tsx` | Updated navigation to `/shop/strain/${product.id}` | ✅ |
| `src/components/shop/ProductGrid.tsx` | Updated import to `StrainQuickView` | ✅ |
| `src/pages/StrainDetail.tsx` | Renamed component, changed param to `strainId` | ✅ |
| `src/components/shop/StrainQuickView.tsx` | Renamed component, updated navigation | ✅ |

### i18n Updates

| File | Change | Status |
|------|--------|--------|
| `src/i18n/locales/en/shop.json` | "cultivars" → "strains" | ✅ |
| `src/i18n/locales/pt/shop.json` | "cultivares" → "estirpes" | ✅ |

---

## Part 3: Dynamic CTAs on Homepage ✅

### File: `src/pages/Index.tsx`

**Hero Section:**
- If `isEligible`: Shows "Browse Strains" → `/shop` and "My Dashboard" → `/dashboard`
- If not eligible: Shows "Check Eligibility" → `/eligibility` and "Sign In" → `/auth`

**Get Started Section:**
- If `isEligible`: "Browse Our Strains" → `/shop`
- If not eligible: "Start Medical Assessment" → `/eligibility`

---

## Testing Steps

1. Visit `/auth` - No test accounts dropdown
2. Sign out, visit homepage - See "Check Eligibility" CTA
3. Sign in as verified patient - See "Browse Strains" CTA
4. Click product in shop - URL should be `/shop/strain/{id}`
5. Search for "cultivar" in codebase - Should return minimal results (only in descriptions/comments)
6. Test English and Portuguese languages
