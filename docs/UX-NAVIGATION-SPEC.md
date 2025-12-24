# Navigation UX Specification

## Behavioral Contract for Header & Navigation

This document defines the behavioral requirements for the Healing Buds navigation system.
It serves as the source of truth for current and future implementations.

---

## 1. Header Zone Rules

The header uses a **3-Zone Grid Layout** that ensures regression-proof architecture.

### Zone Structure

```
┌─────────────┬────────────────────────────────┬─────────────────────┐
│   ZONE 1    │            ZONE 2              │       ZONE 3        │
│    Logo     │         Navigation             │       Actions       │
│  (fixed)    │         (flexible)             │       (fixed)       │
└─────────────┴────────────────────────────────┴─────────────────────┘
```

### Zone Behaviors

| Zone | Content | Constraints |
|------|---------|-------------|
| **Left** | Logo | Fixed width, never shrinks, always visible |
| **Center** | Navigation | Flexible width, collapses FIRST at breakpoints |
| **Right** | Action buttons | Fixed width, never overlaps navigation |

### Non-Regression Guarantees

- ✅ Logo never shrinks below minimum width
- ✅ Navigation collapses before actions
- ✅ Actions never overlap navigation
- ✅ Grid prevents zone overlap by design

---

## 2. Breakpoint Behavior

### Desktop (xl: 1280px and above)

- Full horizontal navigation visible
- Dropdown menus on hover/click
- All action buttons visible
- Theme and language toggles visible

### Tablet/Mobile (below 1280px)

- Navigation hidden
- Hamburger menu button visible
- Full-screen overlay on activation
- Theme toggle visible in header

### Scroll States

| State | Header Height | Visual Changes |
|-------|--------------|----------------|
| **Default** | 96px (mobile), 112px (desktop) | Full logo, normal padding |
| **Scrolled** | 80px (mobile), 88px (desktop) | Compact logo, elevated background |

---

## 3. Overlay Behavior

### Activation

- Triggered by hamburger menu button click
- Disabled at xl+ breakpoints

### Viewport Ownership

```
┌────────────────────────────────────────┐
│          OVERLAY (z-9999)              │
│ ┌────────────────────────────────────┐ │
│ │     HEADER BAR (fixed height)      │ │
│ ├────────────────────────────────────┤ │
│ │                                    │ │
│ │     SCROLLABLE CONTENT AREA        │ │
│ │                                    │ │
│ │     - Navigation links             │ │
│ │     - Dropdowns                    │ │
│ │     - CTAs                         │ │
│ │     - Language/Theme               │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### Requirements

- **100vw / 100dvh** coverage
- **Opaque backdrop** (98% black) blocks all background
- Background content **not readable or clickable**
- Scroll position **restored** on close
- Safe area padding for iOS devices

---

## 4. Focus Management Rules

### Focus Trap

When overlay is open:

1. Focus is **trapped** within the overlay
2. Tab cycles through focusable elements
3. Shift+Tab cycles in reverse
4. Focus cannot escape to background content

### Focus Restoration

When overlay closes:

1. Focus returns to the **trigger element** (hamburger button)
2. Previous scroll position is restored
3. Background accessibility is restored

### Focusable Elements

Within the overlay, in tab order:

1. Close button (X)
2. Logo link
3. Navigation items
4. Dropdown triggers
5. CTA buttons
6. Language switcher
7. Theme toggle

---

## 5. Scroll Locking Rules

### Activation

When mobile menu opens, apply:

```css
body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  top: -${scrollY}px;
  touch-action: none;
}

html {
  overflow: hidden;
}
```

### Restoration

When mobile menu closes:

1. Remove all scroll-lock styles
2. Restore scroll position to saved value
3. Re-enable touch scrolling

### iOS-Safe Handling

- Use `100dvh` for dynamic viewport height
- Include `env(safe-area-inset-bottom)` padding
- Handle rubber-band scrolling prevention

---

## 6. Z-Index Ownership

### Hierarchy (highest to lowest)

| Layer | Z-Index | Component |
|-------|---------|-----------|
| Mobile overlay | 9999 | NavigationOverlay menu surface |
| Mobile backdrop | 9998 | NavigationOverlay backdrop |
| Dropdown menus | 200 | NavigationMenu dropdowns |
| Progress bar | 100 | Scroll progress indicator |
| Header | 50 | Main header container |
| Page content | 0-49 | Page components |

### Layer Ownership Rule

```
Page → Overlay → Menu Surface
```

Each layer fully owns its z-index range. No component should breach these boundaries.

---

## 7. Accessibility Requirements

### WCAG 2.1 AA Compliance

- **Contrast**: All text meets 4.5:1 minimum (7:1 for small text)
- **Touch targets**: Minimum 44x44px on mobile
- **Focus indicators**: Visible 2px ring on all interactive elements
- **Keyboard access**: All functionality accessible via keyboard

### ARIA Roles

| Element | Role/Attribute |
|---------|----------------|
| Navigation | `role="navigation"` |
| Dropdown trigger | `aria-expanded`, `aria-haspopup="menu"` |
| Dropdown menu | `role="menu"` |
| Dropdown item | `role="menuitem"` |
| Mobile overlay | `role="dialog"`, `aria-modal="true"` |
| Close button | `aria-label="Close menu"` |

### Screen Reader Behavior

When overlay opens:

1. Announce "Navigation menu"
2. Background content hidden from screen readers
3. Focus moves to first focusable element

When overlay closes:

1. Announce closure (implicit via focus move)
2. Background content restored to screen readers

---

## 8. Component Responsibilities

### Header.tsx (Structure Only)

✅ 3-zone grid layout enforcement
✅ Logo display
✅ Scroll progress bar
✅ Scroll detection (scrolled state)
✅ Auth state management
✅ Mobile hamburger button
✅ Coordinates child components

❌ No dropdown logic
❌ No overlay logic
❌ No scroll locking
❌ No focus trapping

### NavigationMenu.tsx (Desktop Navigation)

✅ Desktop navigation items
✅ Dropdown expand/collapse
✅ Active state styling
✅ Keyboard navigation
✅ ARIA roles
✅ Click-outside handling

❌ No overlay behavior
❌ No body scroll locking

### NavigationOverlay.tsx (Mobile Overlay)

✅ Full-screen overlay
✅ Focus trap integration
✅ Body scroll locking
✅ Escape key handling
✅ Z-index ownership
✅ Background interaction blocking
✅ Mobile navigation items
✅ Mobile CTAs

---

## 9. Testing Checklist

### Visual Tests

- [ ] Header renders correctly at all breakpoints
- [ ] Logo never overlaps navigation
- [ ] Navigation never overlaps actions
- [ ] Dropdown menus position correctly
- [ ] Overlay covers entire viewport
- [ ] Dark mode maintains contrast

### Interaction Tests

- [ ] Dropdown opens on hover (desktop)
- [ ] Dropdown opens on click (desktop)
- [ ] Dropdown closes on click-outside
- [ ] Overlay opens on hamburger click
- [ ] Overlay closes on X button click
- [ ] Overlay closes on Escape key
- [ ] Overlay closes on route change
- [ ] Background scroll is locked when overlay open
- [ ] Scroll position restores on overlay close

### Accessibility Tests

- [ ] All elements keyboard accessible
- [ ] Focus visible on all interactive elements
- [ ] Focus trapped in overlay when open
- [ ] Focus returns to trigger on close
- [ ] Screen reader announces overlay state
- [ ] Color contrast meets WCAG AA

### Cross-Browser Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

---

## 10. Maintenance Guidelines

### Adding Navigation Items

1. Add to both `NavigationMenu.tsx` and `NavigationOverlay.tsx`
2. Update active state detection if needed
3. Add translation keys
4. Test at all breakpoints

### Modifying Styles

1. Use design tokens from `theme.css`
2. Navigation-specific styles go in `navigation.css`
3. Avoid inline styles for themeable properties
4. Test both light and dark modes

### Updating Breakpoints

1. Update both components consistently
2. Test navigation collapse behavior
3. Verify zone overlap prevention
4. Update this document

---

*Last updated: December 2024*
*Version: 1.0.0*
