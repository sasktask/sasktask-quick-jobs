# SaskTask Platform Strategy: TaskRabbit + Uber Hybrid

## Executive Summary

SaskTask is evolving into a hybrid platform combining **TaskRabbit's marketplace model** (task posting, bidding, flexible scheduling) with **Uber's instant matching paradigm** (real-time availability, location-based suggestions, estimated arrival times). This document outlines how to implement this vision while leveraging existing infrastructure.

---

## 1. CURRENT STATE ANALYSIS

### ✅ What's Already Built

#### Core Infrastructure
- **Auth System**: Phone + Email OTP verification (Supabase Auth + Edge Functions)
- **User Types**: Profiles support all three roles (task giver, task doer, both)
- **Task Management**: Create, edit, browse, filter by category, priority levels
- **Booking System**: Task acceptance, status tracking (pending→accepted→completed)
- **Payment System**: Stripe integration, escrow model, payment history
- **Chat System**: Real-time messaging, message attachments, typing indicators
- **Dispute Resolution**: DisputeDialog component, disputes table, evidence upload (work_evidence, dispute_evidence)
- **Portfolio**: Portfolio items & skill endorsements for profile credibility
- **Verification**: ID/insurance document upload, admin verification workflow
- **Location Support**: Latitude/longitude in tasks & profiles, location details (JSON storage)
- **Notifications**: Real-time notifications, push subscriptions
- **Rating System**: Reviews, ratings, badges, reputation scores
- **Admin Dashboard**: User management, dispute review, verification, fraud detection

#### Database Tables (Key Ones)
- `profiles` (user info, location, ratings, verification)
- `tasks` (task details, budget, location, priority, status)
- `bookings` (task-doer pairing, status, evidence flags)
- `payments` (Stripe integration, escrow amounts, tax fields)
- `disputes` (dispute tracking, status, AI analysis)
- `work_evidence` & `dispute_evidence` (photos, videos, timestamps)
- `task_checkins` (GPS-stamped start/end/pause/resume with geolocation)
- `task_checklists` & `checklist_completions` (digital sign-off requirements)
- `audit_trail_events` (immutable event log for all actions)

---

## 2. REQUIREMENTS MAPPING

### User Types & Roles
| Requirement | Current Status | Gap |
|-------------|---|---|
| Task Giver | ✅ Can post tasks | Need: Instant work mode |
| Task Doer | ✅ Can accept tasks | Need: Real-time availability broadcast |
| Both | ✅ Profiles support dual role | Need: Role-aware UI/features |

### Instant Work (Uber-like)
| Requirement | Current Status | Gap |
|-------------|---|---|
| Real-time location tracking | ❌ Static lat/lon only | Need: Live geolocation updates |
| Nearby doer suggestions | ❌ Browse/search only | Need: Distance-based matching algorithm |
| Estimated time (ETA) | ❌ Not implemented | Need: Distance + doer rating → ETA calc |
| Fallback to farther doers | ❌ No ranking system | Need: Progressive distance expansion |
| Auto-accept notifications | ❌ Manual acceptance | Need: Real-time broadcast to nearby doers |

### Scheduled Work (TaskRabbit-like)
| Requirement | Current Status | Gap |
|-------------|---|---|
| Task posting | ✅ Fully implemented | ✅ Ready |
| Browsing & filtering | ✅ Multiple filters | ✅ Ready |
| Task doer acceptance | ✅ Implemented | ✅ Ready |
| Notes & communication | ✅ Chat system | ✅ Ready |
| Scheduling/calendar | ❌ Partial (date/time fields) | Need: Calendar UI, recurring tasks |

### Dispute & Evidence System
| Requirement | Current Status | Gap |
|-------------|---|---|
| Evidence upload | ✅ work_evidence, dispute_evidence tables | ✅ Ready |
| Evidence verification | ⚠️ UI exists but backend verification minimal | Need: Admin review workflow UI |
| Payment auto-release | ❌ Not implemented | Need: Smart release logic (with consent) |
| Tax deduction | ❌ Database field exists but not calculated | Need: Automatic tax calculation & withholding |

### Certificates & Credentials
| Requirement | Current Status | Gap |
|-------------|---|---|
| Certificate upload | ❌ Not implemented | Need: New table + upload UI |
| Visibility control | ❌ Not implemented | Need: Public/private toggle per cert |
| Profile authenticity | ⚠️ Verification exists | Need: Certificate badges on profile |

---

## 3. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (2-3 weeks)
**Goal**: Enable certificates and improve dispute/payment flow.

#### 1.1 Certificates & Credentials System
**Files to Create/Modify**:
- New migration: `supabase/migrations/20260120_user_certificates.sql`
  ```sql
  CREATE TABLE public.user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_name TEXT NOT NULL,
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  );
  
  ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view public certs"
    ON public.user_certificates FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);
  
  CREATE POLICY "Users can manage own certs"
    ON public.user_certificates FOR ALL
    USING (auth.uid() = user_id);
  ```

- New component: `src/components/CertificateManager.tsx`
  - Upload certificate (PDF, image)
  - Set visibility (public/private)
  - Display verified badge
  - List all certificates

- Modified pages: 
  - `src/pages/Profile.tsx` → Add certificate upload section
  - `src/pages/PublicProfile.tsx` → Show public certificates with badges

**Database**: Add `certificates` to TypeScript types (`supabase/types.ts`)

---

#### 1.2 Improve Dispute Payment Flow
**Files to Modify**:
- `supabase/functions/process-dispute-resolution/index.ts` (new)
  ```typescript
  // Auto-release from escrow with tax deduction
  // Logic:
  // 1. Admin approves dispute
  // 2. Calculate taxes (% from config)
  // 3. Deduct from escrow balance
  // 4. Create wallet transaction
  // 5. Trigger Stripe payout
  // 6. Mark booking as resolved
  ```

- `src/pages/AdminDisputes.tsx` → Add "Release Payment" button with tax preview
- `src/integrations/supabase/client.ts` → Add tax calculation helper

**Tax Logic**:
- Store tax rate in config or per-province
- Automatically withhold on payment release
- Show breakdown to admin before release

---

### Phase 2: Scheduled Work Enhancement (2 weeks)
**Goal**: Polish TaskRabbit-like experience for non-instant tasks.

#### 2.1 Improved Calendar & Scheduling
**Files to Create/Modify**:
- New component: `src/components/TaskCalendar.tsx`
  - Interactive calendar for task scheduling
  - Show availability slots
  - Recurring task UI

- Modified pages:
  - `src/pages/PostTask.tsx` → Integrate calendar component
  - `src/pages/Bookings.tsx` → Calendar view of upcoming tasks

- Use existing `availability_slots` and `recurring_tasks` tables

---

#### 2.2 Task Matching for Scheduled Work
**Files to Create/Modify**:
- New function: `supabase/functions/match-task-doers/index.ts`
  ```typescript
  // Rank doers by:
  // 1. Matching skills/categories
  // 2. Rating/reputation score
  // 3. Completed similar tasks
  // 4. Availability slots
  // Return: sorted list with match % score
  ```

- Modified component: `src/components/TaskDetail.tsx`
  - Show "Recommended Doers" sidebar
  - Auto-notify top 5 matches when task posted

---

### Phase 3: Instant Work (Uber-like) - Core (3-4 weeks)
**Goal**: Real-time matching for immediate task needs.

#### 3.1 Live Availability System
**Database Changes**:
- New table: `user_live_availability`
  ```sql
  CREATE TABLE public.user_live_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('available', 'on-task', 'break')),
    current_location JSONB (lat, lon, accuracy, timestamp),
    last_ping TIMESTAMP,
    available_until TIMESTAMP,
    max_distance_km INT DEFAULT 20
  );
  ```

- Modify `profiles` → Keep `is_online` field for backward compat

**Frontend Changes**:
- New component: `src/components/AvailabilityToggle.tsx`
  - "Go Online" / "Go Offline" button for doers
  - Broadcasts real-time location every 10-30 seconds
  - Shows "Available until" countdown

- New hook: `src/hooks/useGeolocation.ts`
  - Get user's live position
  - Handle permissions
  - Auto-update server
  - Battery-aware (reduce frequency on low battery)

**Backend**:
- New function: `supabase/functions/broadcast-availability/index.ts`
  - Accept location & status update
  - Store in `user_live_availability`
  - Trigger Supabase Realtime broadcast
  - Track ping for "last seen"

---

#### 3.2 Real-Time Task Matching Algorithm
**Files to Create**:
- New function: `supabase/functions/find-nearby-doers/index.ts`
  ```typescript
  // When giver requests instant task:
  // 1. Get giver's location
  // 2. Find doers online within 1km radius (or config)
  // 3. If none: expand to 2km, 5km, 10km, ∞
  // 4. Rank by: distance, rating, completion rate
  // 5. Calculate ETA for each (distance / avg_speed + pickup_time)
  // 6. Return top 5 with ETA, rating, completion rate
  
  // Broadcast to matching doers in real-time
  // via Supabase Realtime channel
  ```

- New function: `supabase/functions/calculate-eta/index.ts`
  ```typescript
  // ETA = (distance_km / avg_doer_speed) + time_to_get_ready
  // avg_doer_speed from historical data (e.g., 15 km/h city avg)
  // time_to_get_ready based on doer's profile (e.g., 5-10 min)
  ```

**Frontend Changes**:
- New page: `src/pages/InstantWork.tsx`
  - "Request instant task" quick flow
  - Show 5 nearest doers with:
    - Photo, name, rating, completion %
    - Distance & ETA
    - "Request" button per doer
  - If no response in 30s, expand radius automatically

- Modified component: `src/components/DashboardLayout.tsx`
  - Show incoming instant requests for doers
  - Notification sound + vibration
  - Accept/Decline buttons with 30s countdown

---

#### 3.3 Real-Time Notifications & Acceptance
**Supabase Realtime Channels**:
- `instant-task::{giver_id}` → Doer accepted
- `availability::{doer_id}` → New instant request
- `task-update::{booking_id}` → Task status changes (start, arrive, complete)

**Modified Files**:
- `src/components/NotificationCenter.tsx` → Add real-time listeners
- `src/hooks/useNotifications.ts` → Real-time subscription logic

---

### Phase 4: Live Tracking & Completion (2-3 weeks)
**Goal**: In-progress task tracking with geolocation proof.

#### 4.1 Real-Time Task Progress Tracking
**Files to Create/Modify**:
- Modified component: `src/pages/Bookings.tsx`
  - When booking is "accepted":
    - Show "Doer arriving" with live map
    - Real-time ETA countdown
    - Call/message buttons
    - Live GPS breadcrumb trail

- New component: `src/components/LiveTaskMap.tsx`
  - Mapbox integration (already in deps)
  - Show doer's live location (with doer permission)
  - Show task location
  - Live ETA

- Modify existing `task_checkins` table usage
  - Doer starts task → creates check-in with GPS
  - Doer arrives → check-in with location proof
  - Doer completes → final check-in with photos

---

#### 4.2 Work Evidence & Digital Sign-Off
**Files to Create/Modify**:
- Modified component: `src/components/EvidenceGallery.tsx`
  - Already exists, enhance with:
    - Photo timestamping
    - GPS location embedding
    - Before/after side-by-side
    - Digital signature for completion

- New component: `src/components/CompletionChecklist.tsx`
  - Show `task_checklists` items
  - Doer checks off completed items
  - Attach photo per item
  - Giver signs off (checksum-based signature)

**Backend Logic**:
- `supabase/functions/verify-task-completion/index.ts`
  - Validates GPS proof in check-ins
  - Confirms all checklist items completed
  - Marks `completion_evidence_uploaded = true`
  - Triggers auto-payment release (if no dispute within 24h)

---

### Phase 5: Dispute Resolution & Auto-Payment (1-2 weeks)
**Goal**: Complete the trust & payment loop.

#### 5.1 Automated Payment Release
**Files to Create/Modify**:
- New function: `supabase/functions/auto-release-payment/index.ts`
  ```typescript
  // Triggered by Cloud Task Scheduler (24h after completion)
  // Logic:
  // 1. Check if booking marked complete + evidence verified
  // 2. Check if giver opened dispute (if yes, skip)
  // 3. Calculate taxes (e.g., 20% for contractor)
  // 4. Deduct taxes from amount
  // 5. Move from escrow → doer wallet → Stripe payout
  // 6. Create audit_trail_event for transparency
  ```

- Modified pages:
  - `src/pages/Payouts.tsx` → Show auto-released payments separately
  - `src/pages/AdminDisputes.tsx` → Show pending auto-releases

**Tax Calculation**:
- Canadian tax tables (federal + provincial)
  - Saskatchewan specific rates
  - Contractor vs. employee logic
  - Store in `supabase/functions/calculate-taxes/index.ts`

---

#### 5.2 Enhanced Dispute Review UI
**Files to Modify**:
- `src/components/DisputeDialog.tsx` → Enhance with:
  - Timeline of events (audit_trail_events)
  - Evidence gallery (before/after)
  - GPS proof map
  - Check-in photos with timestamps
  - AI sentiment analysis of messages (optional)

- `src/pages/AdminDisputes.tsx` → Add:
  - Filter by severity (AI risk score)
  - Recommended decision (from dispute_analysis table)
  - One-click approve/reject with auto-payment trigger
  - Appeal workflow

---

### Phase 6: Analytics & Optimization (1-2 weeks)
**Goal**: Monitor and improve instant matching performance.

#### 6.1 Analytics Dashboard
**New page**: `src/pages/AnalyticsHub.tsx`
- **For Admins**:
  - Instant request acceptance rate by radius/time-of-day
  - Average ETA accuracy vs. actual arrival
  - Dispute rate by category/region
  - Revenue by task type (instant vs. scheduled)

- **For Doers**:
  - Completion rate, earnings, ratings
  - Heatmap of task activity (anonymized)
  - "Growth tips" based on performance

- **For Givers**:
  - Task completion rate
  - Average spend per category
  - Reliability of doers they've hired

#### 6.2 A/B Testing Framework
- Test different matching strategies
- Test notification triggers
- Test ETA algorithms
- Store results in analytics table

---

## 4. DATABASE SCHEMA ADDITIONS

### New Tables Summary

```sql
-- Certificates
CREATE TABLE public.user_certificates (
  id, user_id, name, issuer, issue_date, expiry_date,
  certificate_url, is_public, is_verified, verified_by, verified_at
);

-- Live Availability
CREATE TABLE public.user_live_availability (
  id, user_id, is_online, status, current_location (JSONB),
  last_ping, available_until, max_distance_km
);

-- Instant Task Requests (NEW)
CREATE TABLE public.instant_task_requests (
  id, giver_id, task_category, location, created_at,
  status (pending, accepted, expired), accepted_by_doer_id
);

-- ETA History (for ML optimization)
CREATE TABLE public.eta_accuracy_logs (
  id, booking_id, estimated_eta_mins, actual_arrival_mins,
  created_at
);
```

---

## 5. FEATURE PRIORITY MATRIX

| Feature | Effort | Impact | Phase | Priority |
|---------|--------|--------|-------|----------|
| Certificates | Low | Medium | 1 | 🔴 CRITICAL |
| Improved Disputes | Medium | High | 1 | 🔴 CRITICAL |
| Tax Deduction | Low | High | 1 | 🔴 CRITICAL |
| Calendar/Scheduling | Medium | High | 2 | 🟠 HIGH |
| Task Matching (Scheduled) | Medium | High | 2 | 🟠 HIGH |
| Live Availability Toggle | Low | High | 3 | 🔴 CRITICAL |
| Nearby Doer Matching | High | Very High | 3 | 🔴 CRITICAL |
| Real-Time Notifications | Medium | High | 3 | 🔴 CRITICAL |
| Live Tracking | Medium | High | 4 | 🟠 HIGH |
| Work Evidence UI | Low | High | 4 | 🟠 HIGH |
| Auto-Payment Release | Medium | Very High | 5 | 🔴 CRITICAL |
| Dispute AI Analysis | Low | Medium | 5 | 🟡 MEDIUM |
| Analytics Hub | High | Medium | 6 | 🟡 MEDIUM |

---

## 6. TECH STACK & DEPENDENCIES

### Already In Use ✅
- Supabase (Auth, DB, Realtime, Edge Functions)
- Stripe (Payments)
- Mapbox GL (Mapping)
- Twilio (SMS)
- Resend (Email)
- React + TypeScript + Vite
- TanStack Query (Data fetching)
- Zod (Validation)
- shadcn/ui + Radix UI (UI components)

### Need to Add
- `geolocation-utils` library (distance calculations)
- `date-fns` (date/time handling - maybe already there)
- Possible ML library for dispute risk scoring (TensorFlow.js, scikit-learn API)

---

## 7. IMPLEMENTATION SEQUENCE (Recommended)

```
Week 1-3:   Phase 1 (Certificates + Disputes + Tax)
Week 4-5:   Phase 2 (Scheduling improvements)
Week 6-9:   Phase 3 (Instant matching core)
Week 10-12: Phase 4 (Live tracking)
Week 13-14: Phase 5 (Disputes + Auto-payment)
Week 15-16: Phase 6 (Analytics)

Total: ~4 months for full implementation
```

---

## 8. RISKS & MITIGATION

| Risk | Mitigation |
|------|------------|
| **Geolocation privacy** | Implement granular permission controls, only track during active task |
| **ETA accuracy** | Start with conservative estimates, refine ML model with real data |
| **Instant work latency** | Use Supabase Realtime with message queuing (pg_boss) for high load |
| **Fraud (fake completion)** | Require GPS proof + photos + checklist completion, AI anomaly detection |
| **Tax compliance** | Consult Saskatchewan tax authority, implement CRA withholding tables |
| **Real-time sync conflicts** | Implement optimistic UI + server reconciliation, use row versioning |

---

## 9. SUCCESS METRICS

### Phase 1-2
- ✅ 100% of doers have at least 1 certificate visible
- ✅ Dispute resolution time < 2 business days
- ✅ 95%+ auto-payment releases (no manual intervention)

### Phase 3-4
- ✅ Instant request acceptance time < 2 minutes (within 2km radius)
- ✅ ETA accuracy within ±5 minutes
- ✅ 80%+ acceptance rate for instant requests

### Phase 5
- ✅ 0 payment disputes due to "work not done" (prevented by evidence)
- ✅ 100% taxes auto-calculated & withheld
- ✅ Appeals resolved within 7 days

### Phase 6
- ✅ Revenue per doer +30% (from instant tasks)
- ✅ Task giver satisfaction 4.7+/5.0

---

## 10. QUICK START: Phase 1 Implementation

### Step 1: Create Certificate System
```bash
# 1. Add migration
# 2. Add types to supabase/types.ts
# 3. Create CertificateManager.tsx component
# 4. Add CertificateManager to Profile.tsx
```

### Step 2: Enhance Disputes
```bash
# 1. Create process-dispute-resolution Edge Function
# 2. Add tax calculation helper in integrations
# 3. Enhance AdminDisputes.tsx UI with payment release button
```

### Step 3: Test & Deploy
```bash
# 1. Test certificate upload/visibility
# 2. Test auto-payment with tax deduction
# 3. Deploy and monitor for 1 week
```

---

## 11. QUESTIONS FOR THE TEAM

1. **Certificate Verification**: Who verifies certificates? Admin manually? Or auto-accept PDFs and flag suspicious ones?
2. **Tax Rates**: What % withholding for contractors in Saskatchewan? Federal + provincial?
3. **Instant Work Coverage**: Available initially in Regina/Saskatoon only, or all Saskatchewan?
4. **Payment Hold**: How long before auto-release? 24h? 48h? User-configurable?
5. **Dispute Severity**: What automatically triggers a payment hold vs. auto-release?

---

## Conclusion

This roadmap transforms SaskTask from a **marketplace platform** into a **hybrid instant + scheduled services platform**. By combining TaskRabbit's structured approach with Uber's real-time capabilities, you create a unique value proposition: **"Get help now or schedule it later."**

The phased approach de-risks implementation while maintaining user trust through robust evidence, transparent payments, and fair dispute resolution.

**Next Step**: Pick Phase 1 features, assign developers, and start with certificates this week.
