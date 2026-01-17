# Comment Testing Architecture

## Flow Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Test Flow                            │
│  (general-complains, lightpost, projects, etc.)              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Navigate to entity detail
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  runFlow: comment-flow.yaml                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Tap comment-button                              │    │
│  │  2. Open modal                                      │    │
│  │  3. Enter comment text                              │    │
│  │  4. Tap send-comment-button                         │    │
│  │  5. Verify comment appears                          │    │
│  │  6. Close modal                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  📸 Screenshots taken at each step                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Return to calling flow
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Continue Your Test Flow                         │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Screen with CommentManager
│
├── CommentManager Component
│   │
│   ├── IconButton (testID: "comment-button") 👆 User taps here
│   │
│   └── CommentModal
│       │
│       ├── Close Button (testID: "close-comment-modal")
│       │
│       └── CommentSection
│           │
│           ├── Comment List (ScrollView)
│           │   └── CommentItem (multiple)
│           │
│           └── Add Comment Section
│               ├── TextInput (testID: "comment-input")
│               └── Button (testID: "send-comment-button")
```

## Test Flow Relationships

```
comment-flow.yaml (Reusable Core)
        ↑
        │ Called by
        │
        ├── general-complains-with-comments-flow.yaml
        │
        ├── lightpost-complains-with-comments-flow.yaml
        │
        ├── project-complains-with-comments-flow.yaml (future)
        │
        └── any-other-flow-with-comments.yaml (future)
```

## Test Execution Flow

```
┌─────────────┐
│   Start     │
│   Test      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│  Launch App             │
│  & Authenticate         │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Navigate to            │
│  Feature Section        │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Create/Select          │
│  Entity                 │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Open Entity            │
│  Detail View            │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  runFlow:               │
│  comment-flow.yaml      │◄────── Reusable!
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Continue Test          │
│  or Complete            │
└──────┬──────────────────┘
       │
       ↓
┌─────────────┐
│    End      │
│    Test     │
└─────────────┘
```

## File Organization

```
maestro/
│
├── flows/
│   │
│   ├── comment-flow.yaml ⭐ (REUSABLE)
│   │
│   ├── general-complains-with-comments-flow.yaml (uses comment-flow)
│   ├── lightpost-complains-with-comments-flow.yaml (uses comment-flow)
│   │
│   ├── COMMENT_FLOW_GUIDE.md (detailed documentation)
│   └── QUICK_START_COMMENTS.md (quick reference)
│
├── suites/
│   └── regression-suite.yaml (includes all comment flows)
│
├── screenshots/ (auto-generated)
│   ├── comment_modal_opened.png
│   ├── comment_text_entered.png
│   ├── comment_added.png
│   └── ...
│
└── README.md
```

## Benefits Visualization

```
               Traditional Approach
┌──────────────────────────────────────────┐
│ Flow A: Write 20 lines for comments     │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ Flow B: Write 20 lines for comments     │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ Flow C: Write 20 lines for comments     │
└──────────────────────────────────────────┘
   ❌ 60 lines total
   ❌ Maintain 3 copies
   ❌ Update in 3 places


                Reusable Approach
┌──────────────────────────────────────────┐
│ comment-flow.yaml: 40 lines (once)       │
└───────────────────┬──────────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    ┌───────┐  ┌───────┐  ┌───────┐
    │Flow A │  │Flow B │  │Flow C │
    │1 line │  │1 line │  │1 line │
    └───────┘  └───────┘  └───────┘
   ✅ 43 lines total
   ✅ Maintain 1 copy
   ✅ Update in 1 place
```

## TestID Mapping

```
Component                    TestID                  Purpose
─────────────────────────────────────────────────────────────
CommentManager              comment-button          Open modal
CommentModal                close-comment-modal     Close modal
CommentSection (input)      comment-input           Enter text
CommentSection (button)     send-comment-button     Submit comment
CommentSection (cancel)     cancel-comment-button   Cancel edit
```

## Success Metrics

For each test run with `comment-flow.yaml`:

```
✓ Modal opened
✓ Comment entered
✓ Comment submitted
✓ Comment visible in list
✓ Modal closed
✓ 5 screenshots captured
✓ All assertions passed
─────────────────────────
✅ 100% comment coverage
```
