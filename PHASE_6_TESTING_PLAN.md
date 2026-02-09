# Phase 6: Testing & Validation Plan

Now that Phase 4 (Premium Features) and Phase 5 (UI Polish) are complete, execute this plan to verify system stability.

## 1. Safety Checks (Type & Build)
Run these commands to ensure no regressions were introduced:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for Linting errors
npx next lint

# Attempt a production build
npm run build
```

## 2. Feature Verification

### A. Swipe & Premium Features
1. **Navigate to `/swipe`**
   - [ ] Verify functionality of Right/Left swipes.
   - [ ] Click **Rewind** button.
     - *Expected:* Undo last swipe OR show "Upgrade to Premium" modal (if free user).
   - [ ] Click **Boost** button.
     - *Expected:* Show "Boost Activated" OR "Upgrade to Premium" modal.
   - [ ] Swipe 10 times quickly.
     - *Expected:* If free limit reached, show "Daily Limit" modal.

### B. Match & Likes System
1. **Navigate to `/matches`**
   - [ ] Check "Likes You" rail at the top.
   - [ ] Verify images are **blurred** for free users.
   - [ ] Click a blurred card.
     - *Expected:* "Upgrade to see who likes you" modal.

### C. Chat Experience
1. **Open a Chat (`/messages/[id]`)**
   - [ ] Verify **Skeleton Loader** appears initially.
   - [ ] Send a text message.
     - *Expected:* Message appears immediately (optimistic UI) and persists.
   - [ ] Check Date Separators.
     - *Expected:* "Today", "Yesterday", or date headers appear correctly between messages.
   - [ ] Open User Menu (top right dots).
     - *Expected:* "View Profile", "Report", "Block" options appear.
   - [ ] Test Report/Block flows.

### D. Photo Management
1. **Navigate to `/profile`**
   - [ ] Upload 3+ photos.
   - [ ] Drag the 3rd photo to the 1st position.
     - *Expected:* Visual swap is smooth.
   - [ ] Refresh the page.
     - *Expected:* New order is persisted.

## 3. Mobile Responsiveness
- [ ] Open Chrome DevTools (Cmd+Opt+I) -> Toggle Device Toolbar (Cmd+Shift+M).
- [ ] Test on **iPhone 12/13/14** and **Pixel 5** dimensions.
- [ ] Ensure Chat input area stays visible when "typing".

## 4. Next Steps
Once validation is successful, proceed to **Phase 7: Deployment & Launch Prep**.
