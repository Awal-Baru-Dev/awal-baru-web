# Phase 4: Course Display & Video Player

## Overview

This phase implements the core learning experience - displaying courses, playing video lessons, and tracking progress.

---

## UI/Layout Design

### Design Principles

Following our brand guidelines and improving upon the reference:

1. **Consistency** - Use established color palette (Sky Blue `#1c9af1`, Red CTA `#dc2626`)
2. **Mobile-First** - Design for mobile, enhance for desktop
3. **Performance** - Skeleton loaders, optimistic UI, lazy loading
4. **Accessibility** - Keyboard navigation, focus states, ARIA labels
5. **Indonesian Context** - IDR formatting, Bahasa Indonesia labels

---

### Page Layouts

#### Layout 1: Courses Listing (`/courses`)

```
┌─────────────────────────────────────────────────────────────┐
│  LandingHeader (sticky)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Hero Section (Blue Gradient)                        │   │
│  │  ┌─────────────────────┐  ┌────────────────────┐    │   │
│  │  │ • Badge "PAKET"     │  │                    │    │   │
│  │  │ • Title             │  │  Hero Image       │    │   │
│  │  │ • Description       │  │  (Tedchay)        │    │   │
│  │  │ • Features list     │  │                    │    │   │
│  │  │ • CTA Button (Red)  │  │                    │    │   │
│  │  │ • Price             │  └────────────────────┘    │   │
│  │  └─────────────────────┘                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Section: "Semua Kursus" (count)                           │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Course  │ │  Course  │ │  Course  │ │  Course  │      │
│  │  Card    │ │  Card    │ │  Card    │ │  Card    │      │
│  │          │ │          │ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  (Responsive: 1 col mobile, 2 tablet, 4 desktop)           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LandingFooter                                              │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Adaptation:**
- Hero: Stack vertically (image on top)
- Grid: Single column
- CTA: Full width button

**States:**
- Loading: Skeleton cards (4 placeholders)
- Empty: "Belum ada kursus" illustration
- Error: Retry button with message

---

#### Layout 2: Course Detail - Preview Mode (`/courses/$slug`)

For **non-enrolled** users:

```
┌─────────────────────────────────────────────────────────────┐
│  Minimal Header: [← Kembali]              [Logo]            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────┐ ┌──────────────────┐  │
│  │  Video Preview Section          │ │  Purchase Card   │  │
│  │  ┌─────────────────────────┐   │ │  (Sticky)        │  │
│  │  │                         │   │ │                  │  │
│  │  │   Thumbnail + Play      │   │ │  Price           │  │
│  │  │   Button Overlay        │   │ │  (discount %)    │  │
│  │  │                         │   │ │                  │  │
│  │  │   [Preview Gratis]      │   │ │  ┌────────────┐  │  │
│  │  └─────────────────────────┘   │ │  │ BELI (Red) │  │  │
│  │                                 │ │  └────────────┘  │  │
│  │  Title                          │ │                  │  │
│  │  [Tag] [Tag]                    │ │  Features:       │  │
│  │  Description                    │ │  ✓ Akses selamanya│ │
│  │  Stats: lessons • duration      │ │  ✓ Sertifikat    │  │
│  │                                 │ │  ✓ Komunitas     │  │
│  │  Instructor Card                │ │                  │  │
│  │  ┌─────────────────────────┐   │ │  Payment icons   │  │
│  │  │ [Avatar] Name           │   │ │                  │  │
│  │  │          Title          │   │ └──────────────────┘  │
│  │  └─────────────────────────┘   │                       │
│  │                                 │                       │
│  │  What You'll Learn              │                       │
│  │  ┌─────────┐ ┌─────────┐       │                       │
│  │  │ ✓ Point │ │ ✓ Point │       │                       │
│  │  │ ✓ Point │ │ ✓ Point │       │                       │
│  │  └─────────┘ └─────────┘       │                       │
│  │                                 │                       │
│  │  Curriculum (Locked)            │                       │
│  │  ┌─────────────────────────┐   │                       │
│  │  │ Section 1         🔒    │   │                       │
│  │  │ Section 2         🔒    │   │                       │
│  │  │ Section 3         🔒    │   │                       │
│  │  └─────────────────────────┘   │                       │
│  └─────────────────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Adaptation:**
- Sidebar becomes bottom sticky bar (price + CTA)
- Video preview full width
- Curriculum accordion

---

#### Layout 3: Course Player - Learning Mode (`/courses/$slug/learn`)

For **enrolled** users:

```
┌─────────────────────────────────────────────────────────────┐
│  Player Header: [← Kursus] Course Title        [Progress %] │
├────────────────────────────────────────┬────────────────────┤
│                                        │                    │
│  ┌──────────────────────────────────┐ │  Lesson Sidebar   │
│  │                                  │ │                    │
│  │                                  │ │  Progress Card     │
│  │     YouTube Video Player         │ │  ┌──────────────┐ │
│  │     (16:9 aspect ratio)          │ │  │ 45% complete │ │
│  │                                  │ │  │ ████░░░░░░░░ │ │
│  │                                  │ │  │ 5/11 lessons │ │
│  │                                  │ │  └──────────────┘ │
│  └──────────────────────────────────┘ │                    │
│                                        │  Curriculum       │
│  Current Lesson Info                   │  ┌──────────────┐ │
│  ┌──────────────────────────────────┐ │  │▼ Section 1   │ │
│  │ Section 1 • Pelajaran 3          │ │  │  ✓ Lesson 1  │ │
│  │ Cara Mengisi Form DS-160         │ │  │  ✓ Lesson 2  │ │
│  └──────────────────────────────────┘ │  │  ▶ Lesson 3  │ │
│                                        │  │  ○ Lesson 4  │ │
│  Navigation                            │  │► Section 2   │ │
│  ┌──────────────────────────────────┐ │  │► Section 3   │ │
│  │ [← Sebelumnya]    [Selanjutnya →]│ │  └──────────────┘ │
│  └──────────────────────────────────┘ │                    │
│                                        │  Instructor       │
│                                        │  ┌──────────────┐ │
│                                        │  │ [Av] Tedchay │ │
│                                        │  │      ⭐ 4.9   │ │
│                                        │  └──────────────┘ │
│                                        │                    │
└────────────────────────────────────────┴────────────────────┘
```

**Mobile Adaptation:**
- Full-width video (no sidebar visible)
- Bottom sheet for curriculum (swipe up)
- Floating nav buttons at bottom

```
Mobile Player Layout:
┌─────────────────────────┐
│ [←]  Course Title   [☰] │  ← Hamburger opens sidebar
├─────────────────────────┤
│                         │
│    Video Player         │
│    (Full width)         │
│                         │
├─────────────────────────┤
│ Section 1 • Lesson 3    │
│ Cara Mengisi Form...    │
├─────────────────────────┤
│                         │
│  Lesson content/notes   │
│  (scrollable)           │
│                         │
├─────────────────────────┤
│ [← Prev]    [Next →]    │  ← Fixed bottom nav
└─────────────────────────┘
```

---

### Component Specifications

#### CourseCard

**Improvements over reference:**
- Consistent aspect ratio (16:9 for thumbnails, not 828:914)
- Better hover state (subtle scale + shadow)
- Progress indicator for owned courses
- Skeleton loading state

```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │  Thumbnail 16:9   │  │
│  │  [TAG]            │  │  ← Top left badge
│  │              [✓]  │  │  ← Bottom right if owned
│  └───────────────────┘  │
│                         │
│  Title (2 lines max)    │
│  Description (2 lines)  │
│  By Instructor          │
│                         │
│  🕐 2.5 jam  •  ⭐ 4.9  │
│                         │
│  Rp 299rb  ̶R̶p̶ ̶4̶9̶9̶r̶b̶   │  ← Price or "Lanjutkan"
└─────────────────────────┘
```

**States:**
- Default: Price shown
- Owned: Blue border, "Lanjutkan Belajar" button, progress %
- Hover: Scale 1.02, shadow-lg
- Loading: Skeleton placeholder

---

#### VideoPlayer

**YouTube Integration:**
- Use YouTube IFrame API for progress tracking
- Track: currentTime, duration, playback state
- Events: onProgress (every 10s), onComplete (90%+)

```typescript
interface VideoPlayerProps {
  videoId: string;           // YouTube video ID
  onProgress?: (data: ProgressData) => void;
  onComplete?: () => void;
  resumeFrom?: number;       // Seconds to start from
  autoPlay?: boolean;
}

interface ProgressData {
  currentTime: number;
  duration: number;
  percentWatched: number;
}
```

**UI Elements:**
- Loading spinner while iframe loads
- Error state if video unavailable
- Resume prompt: "Lanjutkan dari 5:32?"

---

#### CurriculumAccordion

**Improvements:**
- Animated expand/collapse
- Progress indicators per section
- Clear current lesson highlight
- Free preview badge on applicable lessons

```
Section Item (Collapsed):
┌─────────────────────────────────────────┐
│ ◐ 01: Persiapan Dokumen    2/5  • 45m  ▼│
└─────────────────────────────────────────┘
     ↑                       ↑     ↑    ↑
  Progress               Count  Time  Toggle
  indicator

Section Item (Expanded):
┌─────────────────────────────────────────┐
│ ✓ 01: Persiapan Dokumen    5/5  • 45m  ▲│
├─────────────────────────────────────────┤
│   ✓  Pengenalan            FREE    8m  │  ← Completed
│   ✓  Dokumen Wajib                12m  │  ← Completed
│   ▶  Cara Mengisi Form           15m  │  ← Current (highlighted)
│   ○  Tips Interview               10m  │  ← Not started
└─────────────────────────────────────────┘
```

---

#### PurchaseCard (Sidebar)

**Sticky behavior:**
- Desktop: Sticky at `top-24`
- Mobile: Fixed bottom bar

```
Desktop:
┌────────────────────────┐
│      Rp 299.000        │
│    ̶R̶p̶ ̶4̶9̶9̶.̶0̶0̶0̶  -40%   │
│                        │
│  ┌──────────────────┐  │
│  │  🔒 Beli Sekarang │  │  ← Red CTA
│  └──────────────────┘  │
│                        │
│  ─────────────────────  │
│                        │
│  ✓ Akses selamanya     │
│  ✓ 15 video pelajaran  │
│  ✓ Sertifikat          │
│  ✓ Akses komunitas     │
│                        │
│  ─────────────────────  │
│                        │
│  [CC] [Bank] [Wallet]  │  ← Payment icons
└────────────────────────┘

Mobile (Bottom Bar):
┌─────────────────────────────────────────┐
│  Rp 299.000  ̶4̶9̶9̶r̶b̶    [Beli Sekarang]  │
└─────────────────────────────────────────┘
```

---

### Color Usage Summary

| Element | Color | CSS |
|---------|-------|-----|
| Primary CTA | Red | `bg-red-600 hover:bg-red-700` |
| Secondary CTA | Blue | `bg-brand-primary hover:bg-brand-primary/90` |
| Progress bar | Blue | `bg-brand-primary` |
| Success/Complete | Green | `text-green-600` |
| Locked/Disabled | Gray | `text-muted-foreground` |
| Current lesson | Blue highlight | `bg-brand-primary/10 border-l-brand-primary` |
| Owned badge | Green | `bg-green-500` |
| Discount badge | Red | `bg-red-500` |
| Free badge | Blue | `bg-brand-primary` |

---

### Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 640px` (Mobile) | Single column, bottom nav, sheet sidebar |
| `640-1024px` (Tablet) | 2-column grid, collapsible sidebar |
| `> 1024px` (Desktop) | 4-column grid, fixed sidebar |

---

### Loading States

**Skeleton Components:**
- `CourseCardSkeleton`: Shimmer effect on thumbnail, text blocks
- `VideoPlayerSkeleton`: Dark rectangle with centered spinner
- `CurriculumSkeleton`: 3-4 gray bars

**Loading Strategy:**
1. Show skeleton immediately
2. Load data with TanStack Query
3. Animate transition (fade in)

---

### Error States

**Course Not Found:**
```
┌─────────────────────────┐
│         🔍              │
│                         │
│  Kursus Tidak Ditemukan │
│  Kursus yang kamu cari  │
│  tidak tersedia.        │
│                         │
│  [Lihat Semua Kursus]   │
└─────────────────────────┘
```

**Video Load Error:**
```
┌─────────────────────────┐
│         ⚠️              │
│                         │
│  Video tidak dapat      │
│  dimuat. Coba lagi.     │
│                         │
│  [Muat Ulang]           │
└─────────────────────────┘
```

---

### Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Card hover scale | 200ms | ease-out | Course cards |
| Accordion expand | 300ms | ease-in-out | Curriculum sections |
| Skeleton shimmer | 1.5s | linear infinite | Loading states |
| Progress update | 300ms | ease-out | Progress bars |
| Page transition | 150ms | ease-in-out | Route changes |

---

## Current State

- **Database types defined:** `Course`, `CourseSection`, `CourseLesson`, `Enrollment`, `LessonProgress`
- **Routes exist:** `/courses` (placeholder only)
- **No components:** `src/components/course/` is empty

---

## Goals

1. Display course catalog with enrollment status
2. Show course details with preview for non-enrolled users
3. Video player with YouTube embed for enrolled users
4. Track lesson progress (percent watched, completion)
5. Resume where user left off

---

## Implementation Breakdown

### Part 1: Data Layer & API (Server Functions)

#### 1.1 Course Data Functions
Create `src/features/courses/actions.ts`:

```typescript
// Server functions for course operations
- getCourses()           // List all published courses
- getCourseBySlug(slug)  // Get single course with full content
- getFeaturedCourses()   // Get featured courses for homepage
```

#### 1.2 Enrollment Functions
Create `src/features/enrollments/actions.ts`:

```typescript
// Server functions for enrollment operations
- getUserEnrollments(userId)           // Get user's enrolled courses
- checkEnrollment(userId, courseId)    // Check if user is enrolled
- getEnrollmentWithCourse(userId, courseId)  // Get enrollment with course details
```

#### 1.3 Progress Functions
Create `src/features/progress/actions.ts`:

```typescript
// Server functions for progress tracking
- getLessonProgress(userId, courseId, sectionId, lessonIndex)
- updateLessonProgress(data)           // Update watch progress
- markLessonComplete(userId, courseId, sectionId, lessonIndex)
- getCourseProgress(userId, courseId)  // Get all progress for a course
```

---

### Part 2: React Query Hooks

#### 2.1 Course Hooks
Create `src/features/courses/hooks.ts`:

```typescript
- useCourses()              // List courses with caching
- useCourse(slug)           // Single course data
- useFeaturedCourses()      // Featured courses
```

#### 2.2 Enrollment Hooks
Create `src/features/enrollments/hooks.ts`:

```typescript
- useUserEnrollments()                    // User's enrollments
- useEnrollmentStatus(courseId)           // Check enrollment
- useEnrollmentWithCourse(courseId)       // Full enrollment data
```

#### 2.3 Progress Hooks
Create `src/features/progress/hooks.ts`:

```typescript
- useCourseProgress(courseId)             // All progress for course
- useLessonProgress(courseId, sectionId, lessonIndex)
- useUpdateProgress()                     // Mutation hook
- useMarkComplete()                       // Mutation hook
```

---

### Part 3: Course Components

#### 3.1 Course Card Component
`src/components/course/course-card.tsx`

- Thumbnail image
- Title, short description
- Price (with discount badge)
- Duration, lesson count
- Rating stars
- "Owned" badge for enrolled users
- Hover effects

#### 3.2 Course Grid
`src/components/course/course-grid.tsx`

- Responsive grid layout
- Loading skeleton
- Empty state

#### 3.3 Course Hero (for detail page)
`src/components/course/course-hero.tsx`

- Large thumbnail/preview video
- Course title & description
- Instructor info
- Stats (duration, lessons, rating)
- Tags/categories

#### 3.4 Course Curriculum
`src/components/course/course-curriculum.tsx`

- Accordion sections
- Lesson list with:
  - Title
  - Duration
  - Free preview badge
  - Lock icon (non-enrolled)
  - Completion checkmark (enrolled)
- Overall progress bar

#### 3.5 Course Sidebar (Purchase Card)
`src/components/course/course-sidebar.tsx`

- Price display with discount
- "Buy Now" CTA button
- Features list (lifetime access, certificate, etc.)
- Payment methods icons
- For enrolled: "Continue Learning" button

#### 3.6 What You'll Learn
`src/components/course/what-you-learn.tsx`

- Grid of learning points with checkmarks

---

### Part 4: Video Player Components

#### 4.1 YouTube Player
`src/components/course/youtube-player.tsx`

- YouTube iframe embed
- Responsive aspect ratio
- Loading state
- Props: videoId, onProgress, onComplete

#### 4.2 Video Player with Progress
`src/components/course/video-player-with-progress.tsx`

- Wraps YouTube player
- Tracks watch progress (periodic saves)
- Handles completion (90%+ watched)
- Resume from last position
- Auto-advance to next lesson option

#### 4.3 Lesson Navigation
`src/components/course/lesson-navigation.tsx`

- Previous/Next buttons
- Current lesson indicator
- Disabled states at boundaries

#### 4.4 Lesson Sidebar
`src/components/course/lesson-sidebar.tsx`

- Full curriculum with progress
- Clickable lessons
- Current lesson highlight
- Collapsible sections

---

### Part 5: Route Pages

#### 5.1 Courses Listing Page
`src/routes/courses/index.tsx`

- Hero section (bundle offer or welcome back)
- Course grid with all courses
- Filter/sort options (future)
- Loading states

#### 5.2 Course Detail Page
`src/routes/courses/$slug.tsx`

Two views based on enrollment:

**Non-enrolled (Preview):**
- Course hero with preview video
- "What you'll learn" section
- Curriculum (locked lessons)
- Purchase sidebar
- Instructor section

**Enrolled (Full Access):**
- Redirect to lesson player OR
- Show course overview with "Continue" button

#### 5.3 Lesson Player Page
`src/routes/courses/$slug/learn.tsx`

- Video player (main content)
- Current lesson info
- Lesson sidebar (curriculum)
- Navigation buttons
- Progress tracking active

---

### Part 6: Progress Tracking System

#### 6.1 Progress Tracking Logic

```typescript
// Track progress every 10 seconds during playback
// Save: percent_watched, seconds_watched, last_position

// Mark complete when:
// - User watches 90%+ of video
// - OR user manually marks complete

// Resume logic:
// - Fetch last_position on load
// - Start video from that position
// - Show "Resume from X:XX" UI
```

#### 6.2 Progress API Endpoints
`src/routes/api/progress/...`

- POST `/api/progress/update` - Update progress
- GET `/api/progress/course/$courseId` - Get course progress
- POST `/api/progress/complete` - Mark lesson complete

---

## File Structure (New Files)

```
src/
├── features/
│   ├── courses/
│   │   ├── actions.ts      # Server functions
│   │   ├── hooks.ts        # React Query hooks
│   │   └── types.ts        # Additional types
│   ├── enrollments/
│   │   ├── actions.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   └── progress/
│       ├── actions.ts
│       ├── hooks.ts
│       └── types.ts
├── components/
│   └── course/
│       ├── index.ts        # Barrel export
│       ├── course-card.tsx
│       ├── course-grid.tsx
│       ├── course-hero.tsx
│       ├── course-curriculum.tsx
│       ├── course-sidebar.tsx
│       ├── what-you-learn.tsx
│       ├── youtube-player.tsx
│       ├── video-player-with-progress.tsx
│       ├── lesson-navigation.tsx
│       └── lesson-sidebar.tsx
├── routes/
│   ├── courses/
│   │   ├── index.tsx       # Course listing (update)
│   │   ├── $slug.tsx       # Course detail (new)
│   │   └── $slug.learn.tsx # Lesson player (new)
│   └── api/
│       └── progress/
│           ├── update.ts   # Update progress endpoint
│           └── course.$courseId.ts  # Get progress endpoint
```

---

## Implementation Order

### Week 1: Foundation
1. [ ] Create course server functions (`features/courses/actions.ts`)
2. [ ] Create course hooks (`features/courses/hooks.ts`)
3. [ ] Build `CourseCard` component
4. [ ] Build `CourseGrid` component
5. [ ] Update `/courses` listing page with real data

### Week 2: Course Detail
6. [ ] Create enrollment server functions
7. [ ] Create enrollment hooks
8. [ ] Build course detail components (Hero, Curriculum, Sidebar, WhatYouLearn)
9. [ ] Create `/courses/$slug` route (preview mode)
10. [ ] Add enrollment check logic

### Week 3: Video Player
11. [ ] Build `YouTubePlayer` component
12. [ ] Build `VideoPlayerWithProgress` component
13. [ ] Create progress server functions
14. [ ] Create progress hooks
15. [ ] Build lesson sidebar component

### Week 4: Lesson Player & Polish
16. [ ] Create `/courses/$slug/learn` route
17. [ ] Implement progress tracking (save every 10s)
18. [ ] Implement resume functionality
19. [ ] Add lesson navigation (prev/next)
20. [ ] Testing & bug fixes

---

## Database Queries Reference

### Get Published Courses
```sql
SELECT * FROM courses
WHERE is_published = true
ORDER BY display_order, created_at DESC
```

### Check Enrollment
```sql
SELECT * FROM enrollments
WHERE user_id = $1
  AND course_id = $2
  AND payment_status = 'paid'
```

### Get Lesson Progress
```sql
SELECT * FROM lesson_progress
WHERE user_id = $1
  AND course_id = $2
  AND section_id = $3
  AND lesson_index = $4
```

### Upsert Progress
```sql
INSERT INTO lesson_progress (user_id, course_id, section_id, lesson_index, ...)
VALUES ($1, $2, $3, $4, ...)
ON CONFLICT (user_id, course_id, section_id, lesson_index)
DO UPDATE SET
  percent_watched = GREATEST(lesson_progress.percent_watched, $5),
  seconds_watched = $6,
  last_position = $7,
  updated_at = NOW()
```

---

## UI/UX Considerations

1. **Loading States**: Skeleton loaders for course cards and detail page
2. **Error States**: Friendly error messages with retry options
3. **Empty States**: "No courses yet" with CTA
4. **Progress Feedback**: Toast on lesson complete, progress bar updates
5. **Mobile**: Collapsible sidebar, full-width video
6. **Accessibility**: Keyboard navigation, screen reader support

---

## Dependencies

- YouTube IFrame API (for video tracking)
- Existing: TanStack Query, Supabase client

---

## Success Criteria

- [ ] Users can browse all published courses
- [ ] Users can view course details and curriculum
- [ ] Non-enrolled users see preview + purchase CTA
- [ ] Enrolled users can watch lessons
- [ ] Progress is tracked and persisted
- [ ] Users can resume from where they left off
- [ ] Lessons can be marked as complete
- [ ] Overall course progress is visible

---

*Created: December 2024*
*Status: Planning*
