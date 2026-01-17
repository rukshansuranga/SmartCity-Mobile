# Reusable Comment Flow Guide

## Overview

The `comment-flow.yaml` is a reusable Maestro test flow that can be integrated into any test that needs to verify comment functionality.

## Usage

### Basic Usage

Include the comment flow in your test using the `runFlow` command:

```yaml
# After navigating to a screen with a comment button
- runFlow: comment-flow.yaml
```

### Prerequisites

Before running the comment flow, ensure:

1. You are on a screen that displays a comment button (CommentManager component)
2. The entity (complain, project, etc.) has been created
3. User is authenticated and has permission to comment

### Example Integration

```yaml
---
appId: com.rukshansuranga.smartcity
name: Test with Comments
---
# ... your setup steps ...

# Navigate to detail view of your entity
- tapOn: "Your Entity Name"
- extendedWaitUntil:
    visible: "Entity Details"
    timeout: 10000

# Run the reusable comment flow
- runFlow: comment-flow.yaml
# Continue with your test...
```

## What the Comment Flow Tests

1. **Opening Comment Modal**
   - Taps the comment button (testID: `comment-button`)
   - Verifies the modal opens with "Comments" header
   - Takes screenshot

2. **Adding a Comment**
   - Enters text in the comment input field
   - Submits the comment
   - Verifies the comment appears in the list
   - Takes screenshot

3. **Viewing Comments**
   - Scrolls through comment list
   - Takes screenshot of comments

4. **Closing Modal**
   - Closes the comment modal
   - Verifies modal is dismissed
   - Takes screenshot

## TestIDs Used

The following testIDs are used by the comment flow:

- `comment-button` - IconButton in CommentManager
- `comment-input` - TextInput for entering comments
- `send-comment-button` - Button to submit comment
- `close-comment-modal` - IconButton to close modal

## Files That Support Comment Testing

### Components

- `components/CommentManager.tsx` - Entry point for comments
- `components/CommentModal.tsx` - Modal wrapper
- `components/CommentSection.tsx` - Main comment functionality

### Flows That Use Comments

- `general-complains-with-comments-flow.yaml` - Example of comment flow integration
- Add your own flows here as you create them

## Tips

1. **Timing**: Ensure the comment button is visible before running the flow
2. **Permissions**: Verify the user has permission to comment on the entity
3. **Network**: Allow sufficient time for API calls to complete
4. **Screenshots**: All screenshots are saved to `maestro/screenshots/`

## Extending the Flow

You can create variations of the comment flow for specific scenarios:

```yaml
# Test editing a comment
- runFlow: comment-flow.yaml
- tapOn:
    id: "edit-comment-button"
- inputText: "Updated comment text"
- tapOn:
    id: "send-comment-button"

# Test deleting a comment
- runFlow: comment-flow.yaml
- tapOn:
    id: "delete-comment-button"
- tapOn: "Delete"
```

## Troubleshooting

### Comment button not found

- Verify the entity detail screen is properly loaded
- Check that CommentManager is rendered on the screen
- Ensure the entity has a valid ID

### Modal doesn't open

- Check testID is correctly set on IconButton
- Verify modal animation completes
- Increase extendedWaitUntil timeout if needed

### Comment not appearing

- Verify network connectivity
- Check API endpoint is responding
- Ensure proper permissions for the user
