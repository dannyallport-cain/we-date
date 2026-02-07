# WeDate - Complete Feature Implementation Plan

**Status**: 🚧 In Progress (Phase 1: Critical Blockers)  
**Last Updated**: February 7, 2026  
**Target Launch**: April 2026 (8-10 weeks)

---

## 📊 Current Status

Your app has a **solid 50-60% foundation** with:
- ✅ Database schema (Users, Photos, Matches, Messages, Swipes)
- ✅ Authentication (JWT, bcrypt)
- ✅ Swipe mechanics with card UI
- ✅ Basic matching system
- ✅ Interests & prompts seeded (70+ interests, 30+ prompts)

**Critical Missing**: Photo uploads, messaging UI, location services, email/SMS verification

---

## 🎯 Implementation Roadmap

### **PHASE 1: Critical Blockers** (Week 1-2) 🚧 IN PROGRESS
Must complete before MVP launch:

#### 1.1 Photo Upload System
- [ ] Cloudinary integration for image hosting
- [ ] Photo upload API endpoint (`POST /api/profile/photos`)
- [ ] Photo reordering, deletion, primary photo selection
- [ ] Image optimization (WebP, 800x800, quality 85%)
- [ ] Photo grid UI with drag-to-reorder
- [ ] Validation: 2-9 photos, JPG/PNG/WebP, 10MB max

#### 1.2 Location Services
- [ ] Browser Geolocation API integration
- [ ] Haversine distance formula calculation
- [ ] Location validation with reverse geocoding (Google Maps API)
- [ ] Distance filtering in discovery (5-100 miles slider)
- [ ] Show distance on profile cards ("2 miles away")
- [ ] Manual city picker + GPS toggle

#### 1.3 Real-Time Messaging
- [ ] Message API (`GET/POST /api/messages`)
- [ ] Chat UI with message bubbles, timestamps
- [ ] Image sharing in messages
- [ ] Polling for real-time updates (3-second interval)
- [ ] Read receipts, typing indicator
- [ ] Unread message count on matches tab
- [ ] Conversation starter suggestions

#### 1.4 Email Verification (Resend)
- [ ] Resend API integration
- [ ] Send 6-digit code on signup (10-min expiry)
- [ ] Email verification page (`/auth/verify`)
- [ ] Block app access until verified
- [ ] Resend email button (rate limited: 1/min)

#### 1.5 SMS Verification (Twilio)
- [ ] Twilio Verify API integration
- [ ] Phone number entry + code verification page
- [ ] Two-step verification (email → phone)
- [ ] "Verified" badge on profiles
- [ ] Store phone number in User model

---

### **PHASE 2: Essential User Experience** (Week 3-4)
Onboarding, profiles, settings:

#### 2.1 Complete Onboarding Flow (8 Steps)
- [ ] Step 1: Name, birthday, gender (`/onboarding/basics`)
- [ ] Step 2: Photo upload (`/onboarding/photos`)
- [ ] Step 3: Location (`/onboarding/location`)
- [ ] Step 4: Select interests - min 5 (`/onboarding/interests`)
- [ ] Step 5: Answer 3 prompts (`/onboarding/prompts`)
- [ ] Step 6: Bio, job, school (`/onboarding/about`)
- [ ] Step 7: Set age/distance preferences (`/onboarding/preferences`)
- [ ] Step 8: Review profile (`/onboarding/review`)
- [ ] Progress bar component (1/8, 2/8, etc.)

#### 2.2 User Profile View
- [ ] View other users' profiles (`/profile/[userId]`)
- [ ] Scrollable photo carousel
- [ ] Display bio, interests, prompts, distance
- [ ] Accessible from swipe screen, match list
- [ ] "Report" and "Unmatch" buttons

#### 2.3 Settings & Preferences
- [ ] Settings page (`/settings`)
- [ ] Discovery: age slider, distance slider, gender preference
- [ ] Notifications: toggle matches, messages, likes, promo
- [ ] Privacy: hide profile, show on Discover toggle
- [ ] Account: logout, delete account with confirmation
- [ ] Blocked users list (`/settings/blocked`)

#### 2.4 Interests & Prompts UI
- [ ] InterestPicker component with 9 categories
- [ ] Multi-select with colorful pills
- [ ] PromptSelector dropdown + text area (150 char limit)
- [ ] Display interests/prompts on profile as badges

#### 2.5 Swipe Enhancements
- [ ] "Out of people" empty state with refresh
- [ ] Show mutual interest badge (shared interests/prompts)
- [ ] Profile completion percentage
- [ ] Undo/rewind button (premium feature)

---

### **PHASE 3: Safety, Trust & Engagement** (Week 5-6)
Verification, reporting, notifications:

#### 3.1 Photo Verification
- [ ] Selfie capture with device camera
- [ ] Pose guide UI ("Look straight, smile")
- [ ] Manual admin verification workflow
- [ ] Blue checkmark badge on verified profiles
- [ ] Verification CTA in settings

#### 3.2 Report & Block System
- [ ] Report modal with reason selection
- [ ] Block user: hide from discovery, delete match
- [ ] Store reports in database
- [ ] Admin dashboard for report review (future)

#### 3.3 Push Notifications
- [ ] Firebase Cloud Messaging (FCM) integration
- [ ] Notification types: match, message, liked you, boost
- [ ] Notification preferences in settings
- [ ] Badge count on Messages tab
- [ ] Mark as read endpoint

#### 3.4 Enhanced Discovery Algorithm
- [ ] Prioritize: active today, verified, complete profiles
- [ ] Personalization: shared interests first (match score)
- [ ] Exclude: blocked, reported, inactive 30+ days
- [ ] "You've seen everyone" + distance expansion option

---

### **PHASE 4: Premium Features** (Week 7)
Basic subscription tier:

#### 4.1 Premium Subscription
- [ ] Stripe integration for payments
- [ ] Premium features: unlimited likes, 5 super likes/week, 1 boost/month, rewind, see who liked you
- [ ] Pricing: $9.99/month, $24.99/3mo, $59.99/year
- [ ] Premium badge on profiles
- [ ] Update User.isPremium, premiumExpiresAt

#### 4.2 Who Liked Me
- [ ] Grid view of users who liked you
- [ ] Blur profiles for free users, clear for premium
- [ ] Tap to like back (instant match)
- [ ] Free users see count only

#### 4.3 Rewind/Undo Swipe
- [ ] Store last swipe in state
- [ ] Rewind button (grayed out if free)
- [ ] Delete swipe, restore to card stack
- [ ] Undo animation

#### 4.4 Boost Feature
- [ ] Boost API endpoint
- [ ] Makes profile 10x more visible for 30 min
- [ ] Profile appears first in discovery
- [ ] Analytics: "X people saw your profile"
- [ ] Free: $4.99 each, Premium: 1/month

---

### **PHASE 5: Polish & Components** (Week 8)
UI improvements, empty states, error handling:

#### 5.1 Landing Page Improvements
- [ ] Success stories section with testimonials
- [ ] Feature highlights with animations
- [ ] Trust badges (500K+ downloads, verified, safe)
- [ ] FAQ accordion
- [ ] App download section (App Store, Google Play)

#### 5.2 Reusable Components
- [ ] EmptyState component (no matches, messages, profiles)
- [ ] SkeletonCard, SkeletonChat (loading states)
- [ ] Toast notifications (react-hot-toast)
- [ ] Error boundary for React errors
- [ ] EditProfileModal (quick edit)
- [ ] MatchModal with confetti animation

---

### **PHASE 6: Admin & Testing** (Week 9)
Sample data, admin tools:

#### 6.1 Sample Profiles
- [ ] Seed script for 50+ diverse profiles
- [ ] Mix of genders, ages, locations, interests
- [ ] Use Unsplash API for placeholder photos
- [ ] Mark as test accounts (User.isTestAccount)

#### 6.2 Admin Dashboard
- [ ] Protected admin route (`/admin`)
- [ ] Stats: users, daily active, matches, messages
- [ ] Review reports: view, ban, warn, dismiss
- [ ] User search and profile view
- [ ] Charts (Chart.js or Recharts)

#### 6.3 Testing Utilities
- [ ] Auto-swipe script for testing
- [ ] Bulk message sender
- [ ] Reset test accounts script
- [ ] Location faker for distance testing

---

### **PHASE 7: Production Readiness** (Week 10)
Performance, caching, monitoring:

#### 7.1 Performance
- [ ] Redis caching layer (profiles, matches, discovery)
- [ ] Rate limiting middleware (Vercel Edge)
- [ ] Next.js Image Optimization
- [ ] Lazy loading for images

#### 7.2 Monitoring
- [ ] Vercel Analytics or Google Analytics 4
- [ ] Track events: sign_up, swipe, match, message, premium
- [ ] Sentry for error monitoring
- [ ] Core Web Vitals tracking

#### 7.3 SEO
- [ ] Open Graph tags for social sharing
- [ ] Dynamic meta descriptions
- [ ] Sitemap.xml and robots.txt
- [ ] Schema.org JSON-LD

---

## 🛠️ Tech Stack Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| **Photo Storage** | Cloudinary | Simple API, built-in CDN, free tier 3GB |
| **Email** | Resend | Modern API, 100 emails/day free, great deliverability |
| **SMS** | Twilio Verify | PCI compliant, fraud detection, $0.05/verification |
| **Payments** | Stripe | Best subscription management, 2.9% + 30¢ |
| **Messaging** | Polling (MVP) | Simpler than WebSockets, scale to Socket.io later |
| **Photo Verify** | Manual review | Free for MVP, add AWS Rekognition later |
| **Location API** | Google Maps | Reverse geocoding, accurate, $200/month free |
| **Notifications** | Firebase FCM | Free, web push support, reliable |
| **Caching** | Redis | Fast, simple, Vercel KV integration |
| **Analytics** | Vercel + Sentry | Built-in, no extra setup |

---

## 📈 Success Metrics (Target for Launch)

| Metric | Target | Industry Avg |
|--------|--------|--------------|
| Onboarding completion | >70% | 60% |
| Avg swipes/session | >10 | 8-12 |
| Match rate | >1.5% | 1-2% |
| Message response rate | >30% | 20-30% |
| Premium conversion | >3% | 2-5% |
| Day 7 retention | >40% | 30-35% |

---

## 🚀 Launch Checklist

### Pre-Launch (Required)
- [ ] Email + SMS verification working
- [ ] Photo upload functional (2-9 photos)
- [ ] Messaging system complete
- [ ] Location & distance filtering working
- [ ] 50+ sample profiles seeded
- [ ] Report & block system functional
- [ ] Mobile responsive (iOS + Android)
- [ ] Privacy policy & terms of service pages
- [ ] App store assets ready (icon, screenshots, description)

### Post-Launch (Week 1)
- [ ] Monitor error rates (Sentry)
- [ ] Track conversion funnel (onboarding completion)
- [ ] A/B test premium pricing
- [ ] Gather user feedback
- [ ] Fix critical bugs within 24h

---

## 📝 Commands

```bash
# Install new dependencies
npm install

# Seed sample profiles
npx prisma db seed

# Development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Run iOS simulator
npx cap run ios
```

---

## 🔗 Resources

- [Cloudinary Setup](https://cloudinary.com/documentation/node_integration)
- [Resend API](https://resend.com/docs/send-with-nodejs)
- [Twilio Verify](https://www.twilio.com/docs/verify/api)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [Firebase FCM](https://firebase.google.com/docs/cloud-messaging/js/client)

---

**Estimated Timeline**: 8-10 weeks (solo developer)  
**MVP Launch Date**: April 2026  
**Full Feature Set**: June 2026
