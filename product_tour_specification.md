# Role-Based Product Tour — Implementation Plan

## Problem

New users land on the dashboard after completing registration/onboarding with **no guided explanation** of what the UI sections mean or where to go next. The existing "Getting Started" cards (in all 3 dashboards) give _text-based checklists_ but never visually point at the actual UI elements. A proper **product tour** should highlight real UI elements with tooltips, walking the user through the interface they're looking at.

> [!IMPORTANT]
> The spec document described tour steps pointing at features that **don't exist yet** (e.g., "RFQ Builder", "Quote Itemization Table", separate "Quotation Comparison Cards"). This plan targets only **real, existing UI elements** — the actual dashboard sections, sidebar navigation, header, and CTA buttons that users see today.

---

## What "Product Tour" Actually Means Here

A product tour is a **visual overlay walkthrough** that:
1. Highlights real UI elements one-by-one with a spotlight/dimmed background
2. Shows a tooltip next to each element explaining what it does
3. Lets the user click Next/Back/Skip to navigate steps
4. Runs **once** on first login, and can be re-triggered from the sidebar

It does **NOT** create new pages or features — it teaches users the ones that already exist.

---

## Proposed Changes

### Driver.js Installation

Install `driver.js` (~5KB, zero dependencies, framework-agnostic) in the frontend.

```bash
cd caterworld-v2-ui && npm install driver.js
```

---

### Tour Infrastructure

#### [NEW] `src/utils/tourEngine.ts`

Thin wrapper around Driver.js that:
- Creates a driver instance with Caterworld-branded styling (purple gradient theme)
- Accepts an array of step configs
- Handles `onDestroyed` to fire completion/skip callbacks

#### [NEW] `src/config/tourSteps.ts`

Role-keyed step configurations targeting **existing** `data-tour` attributes. Three tour configs:

**Individual Tour (5 steps):**
| # | Target | Tooltip | What It Explains |
|---|--------|---------|-----------------|
| 1 | Sidebar navigation | "Your Navigation" | Overview of all sidebar sections available |
| 2 | "Need Catering?" banner + Create Order button | "Start Here" | How to create their first catering order |
| 3 | Action Required section | "Action Required" | Pending tasks that need attention |
| 4 | Schedule/Calendar area | "Your Schedule" | Upcoming deliveries and dates |
| 5 | Notification bell (header) | "Stay Updated" | Where notifications about RFQs/orders appear |

**Corporate Tour (6 steps):**
| # | Target | Tooltip | What It Explains |
|---|--------|---------|-----------------|
| 1 | Sidebar navigation | "Your Navigation" | All corporate sections including Organisation |
| 2 | Summary stats row | "Spending Overview" | Monthly spend, employee reviews, active RFQs |
| 3 | Create Order CTA | "Create Corporate Order" | How to start a catering order |
| 4 | Action Required section | "Tasks Awaiting You" | Approvals, pending RFQs, invoices |
| 5 | Organisation sidebar link | "Your Organisation" | Team, locations, approval rules |
| 6 | Notification bell | "Stay Updated" | Order status changes, approvals |

**Caterer Tour (6 steps):**
| # | Target | Tooltip | What It Explains |
|---|--------|---------|-----------------|
| 1 | Sidebar navigation | "Your Navigation" | Menu management, RFQs, orders, deliveries |
| 2 | Stats cards (revenue, RFQ conversion, rating) | "Your Performance" | Key business metrics at a glance |
| 3 | Action Required section | "Respond to These" | RFQs awaiting response, deliveries to confirm |
| 4 | Lead Pipeline section | "Your Sales Pipeline" | Track leads from new to confirmed |
| 5 | Menu Management sidebar link | "Build Your Menu" | Where to add dishes and pricing |
| 6 | Notification bell | "Incoming Leads" | Get notified of new RFQ matches |

#### [NEW] `src/hooks/useTour.ts`

Custom hook that:
- Reads user type from `sessionStorage` (same pattern as `Dashboard.tsx` and `SideBarNavigation.tsx`)
- Checks `localStorage` for `caterworld_tour_completed_{userType}` 
- Returns `{ shouldShowTour, startTour, completeTour, skipTour, restartTour }`
- On completion/skip, sets the localStorage flag

#### [NEW] `src/components/TourWelcomeModal.tsx`

A modal shown on first login (when tour hasn't been completed) asking:
> *"Welcome to Caterworld! Would you like a quick guided tour of your dashboard?"*  
> **[Take the Tour]** &nbsp; **[Skip for Now]**

Styled with the existing Caterworld purple gradient theme, glassmorphism backdrop.

---

### Data-Tour Attribute Additions

These are the `data-tour="..."` attributes added to existing elements so Driver.js can target them:

#### [MODIFY] `src/components/SideBarNavigation.tsx`
- Add `data-tour="sidebar-nav"` to the desktop `<nav>` element
- Add `data-tour="sidebar-nav-{tooltip}"` to each navigation button (for granular targeting)

#### [MODIFY] `src/components/Dashboard/IndividualDashboard.tsx`
- Add `data-tour="individual-create-order"` to the "Need Catering?" banner
- Add `data-tour="individual-action-required"` to the Action Required section
- Add `data-tour="individual-schedule"` to the Schedule section

#### [MODIFY] `src/components/Dashboard/CorporateDashboard.tsx`
- Add `data-tour="corporate-stats"` to the top stats grid
- Add `data-tour="corporate-create-order"` to the Create Order button
- Add `data-tour="corporate-action-required"` to the Action Required section

#### [MODIFY] `src/components/Dashboard/CatererDashboard.tsx`
- Add `data-tour="caterer-stats"` to the `<CatererStatsSection>` wrapper
- Add `data-tour="caterer-action-required"` to the Action Required section
- Add `data-tour="caterer-lead-pipeline"` to the Lead Pipeline section

#### [MODIFY] `src/components/Dashboard/sections/DashboardSection/DashboardSection.tsx`
- Add `data-tour="header-notifications"` to the notification bell button

---

### Tour Trigger Integration

#### [MODIFY] `src/components/Dashboard/Dashboard.tsx`
- Import and use `useTour` hook
- Render `<TourWelcomeModal>` when `shouldShowTour` is true
- On modal accept → call `startTour()`

#### [MODIFY] `src/components/SideBarNavigation.tsx`
- Add a "Take Tour" button at the bottom of the sidebar (above Logout) with a `Compass` icon
- Clicking it calls `restartTour()` so users can re-trigger the tour anytime

---

### Custom CSS for Tour Overlay

#### [MODIFY] `src/App.css`
- Add Driver.js popover overrides to match Caterworld's design system:
  - Purple gradient header bar on tooltips
  - Rounded corners matching the app's `rounded-xl` style
  - Font family matching the app
  - Animated entrance for popovers

---

## Open Questions

> [!IMPORTANT]
> **Tour on every login vs. only first login?**  
> Current plan: show the welcome modal only on first-ever dashboard visit (per user type). The "Take Tour" sidebar button allows replay anytime. Is this correct, or should it also show after major app updates?

> [!IMPORTANT]
> **Should tour persist across devices?**  
> Current plan uses `localStorage` only (client-side). If a user logs in on a new device, they'll see the tour again. Should we also save tour completion to the backend API (`PATCH /auth/profile` or similar) so it syncs? This requires a backend change.

> [!IMPORTANT]
> **Mobile behavior?**  
> On mobile (`<768px`), the sidebar is hidden behind a hamburger menu. Should the tour:
> - A) Auto-open the mobile sidebar drawer for the sidebar step, or
> - B) Skip the sidebar step on mobile and only tour visible elements?

---

## Verification Plan

### Manual Verification
1. Login as each user type (individual, corporate, caterer)
2. Verify the welcome modal appears on first dashboard visit
3. Click "Take Tour" → confirm all steps highlight the correct elements
4. Click "Skip" → confirm tour doesn't re-appear on page refresh
5. Click "Take Tour" from sidebar → confirm tour replays correctly
6. Verify on mobile viewport that tour doesn't break layout
7. Verify the driver.js overlay doesn't interfere with existing modals/toasts

### Automated Tests
```bash
cd caterworld-v2-ui && npm run test
cd caterworld-v2-ui && npm run typecheck
```
