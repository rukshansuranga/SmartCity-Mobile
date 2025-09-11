# Comment System Documentation

## Overview

A reusable comment system has been created that works with the new backend comment entity structure. The system supports different entity types and provides a clean, conversation-style interface.

## Backend Changes Supported

### New Comment Entity

- `EntityType` enum for different entity types (Complain, LightpostComplain, etc.)
- Support for both Client and User comments
- Updated API endpoints (POST, GET, PUT, DELETE)

### API Endpoints

- `POST /api/comment` - Create comment
- `GET /api/comment/{id}` - Get comment by ID
- `POST /api/comment/entity` - Get comments by entity
- `PUT /api/comment/{id}` - Update comment
- `DELETE /api/comment/{id}` - Delete comment

## Components

### 1. CommentSection (`/components/CommentSection.tsx`)

A reusable component for displaying and managing comments.

#### Props

```typescript
interface CommentSectionProps {
  entityType: EntityType; // Type of entity (GeneralComplain, Project, etc.)
  entityId: string; // ID of the entity
  isPrivate?: boolean; // Whether comments are private
  onCommentAdded?: () => void; // Callback when comment is added
  maxHeight?: number; // Maximum height for comments container
}
```

#### Features

- **Chat-style layout**: Client comments on left, User comments on right
- **Real-time updates**: Fetches comments automatically
- **CRUD operations**: Add, edit, delete comments
- **Responsive design**: Matches app's color scheme
- **Error handling**: Toast notifications for errors
- **Loading states**: Shows loading indicators

#### Usage Example

```typescript
import { CommentSection } from "@/components/CommentSection";
import { EntityType } from "@/types";

<CommentSection
  entityType={EntityType.GeneralComplain}
  entityId="123"
  isPrivate={false}
  onCommentAdded={() => console.log("Comment added!")}
  maxHeight={400}
/>
```

### 2. CommentModal (`/components/CommentModal.tsx`)

A modal wrapper that combines item details with the comment section.

#### Props

```typescript
interface CommentModalProps {
  visible: boolean; // Modal visibility
  onClose: () => void; // Close callback
  selectedItem: any; // The selected item to show details for
  isPrivate: boolean; // Whether in private mode
  onCommentAdded?: () => void; // Callback when comment is added
}
```

#### Features

- **Item details display**: Shows title, description, status, created date
- **Integrated comments**: Uses CommentSection component
- **Responsive layout**: Adapts to screen size
- **Close confirmation**: Asks before closing modal

#### Usage Example

```typescript
import { CommentModal } from "@/components/CommentModal";

<CommentModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  selectedItem={selectedComplain}
  isPrivate={isPrivate}
  onCommentAdded={() => fetchData()}
/>
```

## Updated Files

### 1. Types (`/types/index.ts`)

- Updated `Comment` type to match new backend structure
- Added `EntityType` enum
- Support for both Client and User in comments

### 2. API Actions (`/api/commentAction.ts`)

- Added all CRUD operations for comments
- Support for entity-based comment fetching
- Updated to use new endpoint structure

### 3. GeneralComplainList (`/app/(complains)/general/GeneralComplainList.tsx`)

- Refactored to use new CommentModal
- Removed old comment handling code
- Cleaner, more maintainable code structure

## Comment Display Logic

### Layout Rules

- **Client comments**: Displayed on the left side with light green background
- **User comments**: Displayed on the right side with darker green background
- **Name display**: Shows client/user name and timestamp
- **Owner actions**: Only comment owners can edit/delete their comments

### Visual Design

- **Color scheme**: Matches existing app colors (#22577a, #38a3a5, #57cc99, etc.)
- **Card layout**: Each comment in a styled card
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Clear visual hierarchy and readable text

## Integration with Other Components

To use the comment system with other entity types:

1. **Import the components**:

```typescript
import { CommentSection } from "@/components/CommentSection";
import { EntityType } from "@/types";
```

2. **Use appropriate EntityType**:

```typescript
// For different entity types
EntityType.LightpostComplain;
EntityType.ProjectComplain;
EntityType.Project;
EntityType.GarbageComplain;
```

3. **Pass correct entityId**:

```typescript
// Make sure to convert to string if needed
entityId={item.id.toString()}
```

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Handled by fetchWrapper
- **Validation errors**: Empty comment validation
- **User feedback**: Toast notifications for all operations
- **Loading states**: Visual feedback during operations

## Future Enhancements

Potential improvements for the comment system:

- **Real-time updates**: WebSocket integration
- **Rich text**: Support for formatted text
- **File attachments**: Image/document support
- **Reactions**: Like/dislike functionality
- **Mentions**: User mention system
- **Threading**: Reply to specific comments
