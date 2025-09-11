// Example: How to use getLatestProjectProgressByProjectId in different contexts

import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { getLatestProjectProgressByProjectId } from "./api/projectAction";
import { ProjectProgressApprovedStatus } from "./enums/enum";
import { ProjectProgress } from "./types";

// Example 1: Simple progress display component
export function ProjectProgressIndicator({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getLatestProjectProgressByProjectId(projectId);
        if (response.isSuccess) {
          setProgress(response.data);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [projectId]);

  if (loading) return <Text>Loading progress...</Text>;
  if (!progress) return <Text>No progress data available</Text>;

  return (
    <View>
      <Text>Progress: {progress.progressPercentage}%</Text>
      <Text>
        Status: {getApprovalStatusText(progress.projectProgressApprovedStatus)}
      </Text>
      <Text>Summary: {progress.summary}</Text>
      {progress.description && <Text>Description: {progress.description}</Text>}
      <Text>
        Last Updated: {new Date(progress.progressDate).toLocaleDateString()}
      </Text>
    </View>
  );
}

// Example 2: Progress card for project list
export function ProjectProgressCard({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);

  useEffect(() => {
    getLatestProjectProgressByProjectId(projectId)
      .then((response) => {
        if (response.isSuccess) {
          setProgress(response.data);
        }
      })
      .catch(console.error);
  }, [projectId]);

  return (
    <View
      style={{
        padding: 10,
        backgroundColor: "#f0f0f0",
        margin: 5,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>Latest Progress</Text>
      {progress ? (
        <>
          <Text>{progress.summary}</Text>
          <Text>Progress: {progress.progressPercentage}%</Text>
          <Text>
            Status:{" "}
            {getApprovalStatusText(progress.projectProgressApprovedStatus)}
          </Text>
          {progress.approvedByUser && (
            <Text>
              Approved by: {progress.approvedByUser.firstName}{" "}
              {progress.approvedByUser.lastName}
            </Text>
          )}
        </>
      ) : (
        <Text>Loading progress...</Text>
      )}
    </View>
  );
}

// Example 3: Multiple projects progress comparison
export function MultiProjectProgressComparison({
  projectIds,
}: {
  projectIds: string[];
}) {
  const [progressData, setProgressData] = useState<
    Map<string, ProjectProgress>
  >(new Map());

  useEffect(() => {
    const fetchAllProgress = async () => {
      const progressMap = new Map<string, ProjectProgress>();

      // Fetch progress for all projects in parallel
      const promises = projectIds.map(async (projectId) => {
        try {
          const response = await getLatestProjectProgressByProjectId(projectId);
          if (response.isSuccess) {
            progressMap.set(projectId, response.data);
          }
        } catch (error) {
          console.error(
            `Error fetching progress for project ${projectId}:`,
            error
          );
        }
      });

      await Promise.all(promises);
      setProgressData(progressMap);
    };

    if (projectIds.length > 0) {
      fetchAllProgress();
    }
  }, [projectIds]);

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Projects Progress Comparison
      </Text>
      {projectIds.map((projectId) => {
        const progress = progressData.get(projectId);
        return (
          <View
            key={projectId}
            style={{
              marginBottom: 10,
              padding: 10,
              backgroundColor: "#e8e8e8",
            }}
          >
            <Text>Project ID: {projectId}</Text>
            {progress ? (
              <>
                <Text>Progress: {progress.progressPercentage}%</Text>
                <Text>Summary: {progress.summary}</Text>
                <Text>
                  Status:{" "}
                  {getApprovalStatusText(
                    progress.projectProgressApprovedStatus
                  )}
                </Text>
              </>
            ) : (
              <Text>No progress data</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Helper function to convert approval status to readable text
function getApprovalStatusText(status: ProjectProgressApprovedStatus): string {
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
}

// Example 4: Using in a custom hook
export function useProjectProgress(projectId: string) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLatestProjectProgressByProjectId(projectId);

      if (response.isSuccess) {
        setProgress(response.data);
      } else {
        setError(response.message || "Failed to fetch progress");
      }
    } catch (err) {
      setError("Network error");
      console.error("Error fetching project progress:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      refetch();
    }
  }, [projectId, refetch]);

  return { progress, loading, error, refetch };
}

// Usage of the custom hook:
// const { progress, loading, error, refetch } = useProjectProgress(projectId);
