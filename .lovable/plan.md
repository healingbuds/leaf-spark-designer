
# Visual Edits Implementation Plan

## Summary
Three sets of changes to clean up the codebase and improve user experience:

1. **Remove Test Accounts dropdown** from Auth page
2. **Rename "Cultivar" to "Strain"** globally
3. **Dynamic CTAs** on homepage based on eligibility

---

## Part 1: Remove Test Accounts Dropdown

### File: `src/pages/Auth.tsx`
**Action:** Delete lines 294-398 (the "Test Accounts (Demo Access)" dropdown block)

---

## Part 2: Rename "Cultivar" to "Strain"

### File Renames
| Old File | New File |
|----------|----------|
| `src/pages/CultivarDetail.tsx` | `src/pages/StrainDetail.tsx` |
| `src/components/shop/CultivarQuickView.tsx` | `src/components/shop/StrainQuickView.tsx` |

### Code Updates

| File | Changes |
|------|---------|
| `src/App.tsx` | Update import to `StrainDetail`, change route to `/shop/strain/:strainId` |
| `src/components/shop/ProductCard.tsx` | Update navigation to `/shop/strain/${product.id}` |
| `src/components/shop/ProductGrid.tsx` | Update import to `StrainQuickView` |
| `src/pages/StrainDetail.tsx` | Rename component, change param to `strainId` |
| `src/components/shop/StrainQuickView.tsx` | Rename component, update navigation |

### i18n Updates

| File | Change |
|------|--------|
| `src/i18n/locales/en/shop.json` | "cultivars" → "strains" |
| `src/i18n/locales/pt/shop.json` | "cultivares" → "estirpes" |

---

## Part 3: Dynamic CTAs on Homepage

### File: `src/pages/Index.tsx`

**Hero Section (lines 122-152):**
- If `isEligible`: Show "Browse Strains" → `/shop` and "My Dashboard" → `/dashboard`
- If not eligible: Show "Check Eligibility" → `/eligibility` and "Sign In" → `/auth`

**Get Started Section (lines 373-381):**
- If `isEligible`: "Browse Our Strains" → `/shop`
- If not eligible: "Start Medical Assessment" → `/eligibility`

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Auth.tsx` | Remove test dropdown (lines 294-398) |
| `src/pages/CultivarDetail.tsx` | Rename to `StrainDetail.tsx` |
| `src/components/shop/CultivarQuickView.tsx` | Rename to `StrainQuickView.tsx` |
| `src/App.tsx` | Update import and route |
| `src/components/shop/ProductCard.tsx` | Update navigation path |
| `src/components/shop/ProductGrid.tsx` | Update import |
| `src/pages/Index.tsx` | Add conditional CTAs |
| `src/i18n/locales/en/shop.json` | Update terminology |
| `src/i18n/locales/pt/shop.json` | Update terminology |

---

## Testing Steps

1. Visit `/auth` - No test accounts dropdown
2. Sign out, visit homepage - See "Check Eligibility" CTA
3. Sign in as verified patient - See "Browse Strains" CTA
4. Click product in shop - URL should be `/shop/strain/{id}`
5. Search for "cultivar" in codebase - Should return 0 results
6. Test English and Portuguese languages
