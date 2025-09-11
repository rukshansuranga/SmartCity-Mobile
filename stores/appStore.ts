import { create } from "zustand";

type AppState = {
  unreadNotificationCount: number | null;
  updateNotificationCount: (count: number | null) => void;
  // Current project information for tabs
  currentProjectId: string | null;
  currentProjectType: string | null;
  setCurrentProject: (projectId: string, projectType: string) => void;
  clearCurrentProject: () => void;
};

export const appStore = create<AppState>((set) => ({
  unreadNotificationCount: null,
  updateNotificationCount: (count) => set({ unreadNotificationCount: count }),
  // Current project information
  currentProjectId: null,
  currentProjectType: null,
  setCurrentProject: (projectId, projectType) =>
    set({ currentProjectId: projectId, currentProjectType: projectType }),
  clearCurrentProject: () =>
    set({ currentProjectId: null, currentProjectType: null }),
}));
