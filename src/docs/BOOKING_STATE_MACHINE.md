# Booking State Machine Documentation

## Overview
This document describes the complete booking state machine and payment flow for SaskTask platform.

## Booking States

### 1. **pending** (Initial State)
- **Triggered by**: Task doer applies for a task
- **Who can see**: Task giver and task doer
- **Available actions**:
  - Task Giver: Accept or Reject
  - Task Doer: Cancel application
- **Payment**: No payment yet

### 2. **accepted**
- **Triggered by**: Task giver accepts application
- **Payment**: Escrow payment triggered (task giver → platform account)
- **Available actions**:
  - Task Doer: Start task or Cancel
  - Task Giver: Cancel (with fee)
- **Chat**: Enabled between both parties

### 3. **in_progress**
- **Triggered by**: Task doer starts the task
- **Payment**: Funds held in escrow
- **Available actions**:
  - Task Doer: Mark as complete
  - Task Giver: Mark as complete
  - Both: Cancel (penalties apply)
- **Chat**: Active

### 4. **completed**
- **Triggered by**: Either party marks as complete
- **Payment**: Payout triggered (platform → task doer)
- **Available actions**:
  - Both: Leave review/rating
- **Chat**: Read-only or archived

### 5. **cancelled**
- **Triggered by**: Either party cancels
- **Payment**: Refund logic with cancellation fees
  - If cancelled before accepted: Full refund
  - If cancelled after accepted: 10-20% fee applies
- **Available actions**: None (terminal state)

### 6. **rejected**
- **Triggered by**: Task giver rejects application
- **Payment**: No payment
- **Available actions**: None (terminal state)

## State Transition Diagram

```
           ┌─────────┐
           │ pending │
           └────┬────┘
                │
       ┌────────┴────────┐
       │                 │
   [Accept]         [Reject]
       │                 │
       ▼                 ▼
  ┌─────────┐      ┌──────────┐
  │accepted │      │ rejected │
  └────┬────┘      └──────────┘
       │
  [Start Task]
       │
       ▼
  ┌────────────┐
  │in_progress │
  └─────┬──────┘
        │
   [Complete]
        │
        ▼
  ┌───────────┐
  │ completed │
  └───────────┘

  [Cancel] can happen from any non-terminal state
        │
        ▼
  ┌───────────┐
  │ cancelled │
  └───────────┘
```

## Payment Flow

### Escrow (accepted → in_progress)
1. Task giver's payment method charged
2. Funds held in platform account
3. Platform fee deducted (e.g., 15%)
4. Net amount reserved for task doer

### Payout (completed)
1. Task marked complete by either party
2. 24-hour grace period for disputes
3. If no disputes, payout to task doer
4. Both parties can leave reviews

### Refunds (cancelled)
- **Before accepted**: 100% refund to task giver
- **After accepted**: 90% refund (10% cancellation fee)
- **After in_progress**: 80% refund (20% cancellation fee)
- **Refund timeline**: 5-7 business days

## Key Features

### Real-time Chat
- Enabled only for accepted and in_progress bookings
- Both parties can send messages, attachments, voice notes
- Typing indicators and read receipts
- Message pinning for important information

### Notifications
All state changes trigger notifications:
- New booking request → Task giver notified
- Booking accepted → Task doer notified
- Task started → Task giver notified
- Task completed → Both parties notified
- Cancellation → Other party notified

### Reviews & Ratings
- Available after completion
- Both parties can rate each other
- 5-star system with optional comment
- Affects user ratings and trust scores

## Security (RLS Policies)

- Users can only view bookings where they are task_giver or task_doer
- Only task_doers can create initial bookings (applications)
- Status updates validated server-side
- Payment operations require proper authentication
- Chat restricted to booking participants

## Admin Capabilities

Admins can:
- View all bookings
- Monitor state transitions
- Handle disputes
- Override status for conflict resolution
- Access full chat history for investigations
