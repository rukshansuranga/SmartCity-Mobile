# How to Use getLatestProjectProgressByProjectId

This guide explains how to use the `getLatestProjectProgressByProjectId` function to fill project phases with real data from your API.

## Function Overview

```typescript
async function getLatestProjectProgressByProjectId(
  projectId: string
): Promise<ApiResponse<ProjectProgress>>;
```

**Location**: `api/projectAction.ts`

**Parameters**:

- `projectId`: The unique identifier of the project

**Returns**: A Promise that resolves to an `ApiResponse<ProjectProgress>` containing:

- `isSuccess`: Boolean indicating if the request was successful
- `message`: Status message
- `data`: ProjectProgress object (if successful)
- `errors`: Array of error messages (if any)

## ProjectProgress Data Structure

```typescript
type ProjectProgress = {
  projectId: string;
  summary: string;
  description?: string;
  progressDate: string;
  projectProgressApprovedStatus: ProjectProgressApprovedStatus;
  progressPercentage: number;
  approvedBy?: string;
  approvedByUser?: {
    userId: string;
    firstName: string;
    lastName?: string;
  };
};
```

## Usage Examples

### 1. Basic Usage

```typescript
import { getLatestProjectProgressByProjectId } from "@/api/projectAction";

const fetchProjectProgress = async (projectId: string) => {
  try {
    const response = await getLatestProjectProgressByProjectId(projectId);

    if (response.isSuccess) {
      const progress = response.data;
      console.log("Progress:", progress.progressPercentage + "%");
      console.log("Summary:", progress.summary);
      console.log("Status:", progress.projectProgressApprovedStatus);
    } else {
      console.error("Failed to fetch progress:", response.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### 2. In React Component with State Management

```typescript
import { useState, useEffect } from 'react';
import { getLatestProjectProgressByProjectId } from '@/api/projectAction';

function ProjectProgressComponent({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const response = await getLatestProjectProgressByProjectId(projectId);

        if (response.isSuccess) {
          setProgress(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProgress();
    }
  }, [projectId]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!progress) return <Text>No progress data</Text>;

  return (
    <View>
      <Text>Progress: {progress.progressPercentage}%</Text>
      <Text>Summary: {progress.summary}</Text>
      <Text>Last Updated: {new Date(progress.progressDate).toLocaleDateString()}</Text>
    </View>
  );
}
```

### 3. Error Handling Best Practices

```typescript
const handleProgressFetch = async (projectId: string) => {
  try {
    const response = await getLatestProjectProgressByProjectId(projectId);

    if (!response.isSuccess) {
      // Handle API errors
      console.error("API Error:", response.message);

      // Log individual errors if available
      if (response.errors && response.errors.length > 0) {
        response.errors.forEach((error) => console.error("- ", error));
      }

      return null;
    }

    return response.data;
  } catch (error) {
    // Handle network/connection errors
    console.error("Network Error:", error);
    return null;
  }
};
```

### 4. Using with Multiple Projects

```typescript
const fetchMultipleProjectProgress = async (projectIds: string[]) => {
  const progressData = new Map<string, ProjectProgress>();

  // Fetch all progress data in parallel
  const promises = projectIds.map(async (projectId) => {
    try {
      const response = await getLatestProjectProgressByProjectId(projectId);
      if (response.isSuccess) {
        progressData.set(projectId, response.data);
      }
    } catch (error) {
      console.error(
        `Failed to fetch progress for project ${projectId}:`,
        error
      );
    }
  });

  await Promise.all(promises);
  return progressData;
};
```

## Integration in Project Progress Screen

The main integration is in `/app/(projects)/project-tabs/project-progress.tsx`:

### Key Changes Made:

1. **Added imports**:

   ```typescript
   import { getLatestProjectProgressByProjectId } from "../../../api/projectAction";
   import { ProjectProgress as ProjectProgressType } from "../../../types";
   ```

2. **Added state management**:

   ```typescript
   const [projectProgress, setProjectProgress] =
     useState<ProjectProgressType | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   ```

3. **Added data fetching**:

   ```typescript
   const fetchProjectProgress = useCallback(async () => {
     const response = await getLatestProjectProgressByProjectId(
       projectId as string
     );
     // Handle response...
   }, [projectId]);
   ```

4. **Dynamic progress data**:
   ```typescript
   const progressData = projectProgress
     ? [
         {
           phase: projectProgress.summary || "Current Phase",
           progress: projectProgress.progressPercentage / 100,
           status: getApprovalStatusText(
             projectProgress.projectProgressApprovedStatus
           ),
           date: projectProgress.progressDate,
           description: projectProgress.description,
         },
       ]
     : defaultProgressData;
   ```

## Approval Status Handling

The `ProjectProgressApprovedStatus` enum has three values:

- `Pending` (0)
- `Approved` (1)
- `Rejected` (2)

Helper function to convert to readable text:

```typescript
const getApprovalStatusText = (
  status: ProjectProgressApprovedStatus
): string => {
  switch (status) {
    case ProjectProgressApprovedStatus.Pending:
      return "Pending";
    case ProjectProgressApprovedStatus.Approved:
      return "Approved";
    case ProjectProgressApprovedStatus.Rejected:
      return "Rejected";
    default:
      return "Unknown";
  }
};
```

## Benefits of This Implementation

1. **Real-time Data**: Shows actual project progress from the backend
2. **Error Handling**: Graceful fallback to default data when API fails
3. **Loading States**: Proper loading indicators for better UX
4. **Approval Information**: Shows who approved the progress and when
5. **Flexible Display**: Adapts UI based on available data
6. **Type Safety**: Full TypeScript support with proper types

## Testing

To test the implementation:

1. Ensure you have a valid `projectId`
2. Check that your backend API endpoint `/project/{projectId}/progress/latest` is working
3. Verify the API returns data in the expected `ProjectProgress` format
4. Test with different approval statuses to see the UI changes
5. Test error scenarios (invalid projectId, network issues) to verify fallback behavior

## Performance Considerations

- Use `useCallback` for async functions to prevent unnecessary re-renders
- Consider caching progress data if it doesn't change frequently
- Implement proper loading states to avoid blocking the UI
- Use parallel requests when fetching multiple projects' progress
