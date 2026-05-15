import {
  getNewsDetail,
  getNewsFeed,
  getUnreadNewsCount,
  markNewsAsRead,
} from "@/api/newsAction";
import { PushNotificationService } from "@/lib/pushNotificationService";
import { NewsDetail, NewsItem } from "@/types";
import { create } from "zustand";

type NewsState = {
  // News feed data
  newsList: NewsItem[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Current news detail
  currentNews: NewsDetail | null;
  isLoadingDetail: boolean;

  // Unread count
  unreadCount: number;

  // Actions
  loadNewsFeed: (residentId: string, page?: number) => Promise<void>;
  refreshNewsFeed: (residentId: string) => Promise<void>;
  loadNewsDetail: (residentId: string, newsId: number) => Promise<void>;
  markAsRead: (residentId: string, newsId: number) => Promise<void>;
  loadUnreadCount: (residentId: string) => Promise<void>;
  clearNewsList: () => void;
  clearCurrentNews: () => void;
};

export const useNewsStore = create<NewsState>((set, get) => ({
  // Initial state
  newsList: [],
  currentPage: 0,
  totalPages: 0,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  error: null,

  currentNews: null,
  isLoadingDetail: false,

  unreadCount: 0,

  // Load news feed (paginated)
  loadNewsFeed: async (residentId: string, page = 1) => {
    const state = get();

    // Prevent loading if already loading or no more pages
    if (state.isLoading || (!state.hasMore && page > 1)) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const response = await getNewsFeed(residentId, page, 20);

      if (response.isSuccess && response.data) {
        const { items, pageIndex, totalPages: total } = response.data;

        set((state) => ({
          newsList: page === 1 ? items : [...state.newsList, ...items],
          currentPage: pageIndex,
          totalPages: total,
          hasMore: pageIndex < total,
          isLoading: false,
        }));
      } else {
        set({
          error: response.message || "Failed to load news",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error loading news feed:", error);
      set({
        error: "An error occurred while loading news",
        isLoading: false,
      });
    }
  },

  // Refresh news feed (pull to refresh)
  refreshNewsFeed: async (residentId: string) => {
    try {
      set({ isRefreshing: true, error: null });

      const response = await getNewsFeed(residentId, 1, 20);

      if (response.isSuccess && response.data) {
        const { items, pageIndex, totalPages: total } = response.data;

        set({
          newsList: items,
          currentPage: pageIndex,
          totalPages: total,
          hasMore: pageIndex < total,
          isRefreshing: false,
        });

        // Also refresh unread count
        get().loadUnreadCount(residentId);
      } else {
        set({
          error: response.message || "Failed to refresh news",
          isRefreshing: false,
        });
      }
    } catch (error) {
      console.error("Error refreshing news feed:", error);
      set({
        error: "An error occurred while refreshing news",
        isRefreshing: false,
      });
    }
  },

  // Load news detail
  loadNewsDetail: async (residentId: string, newsId: number) => {
    try {
      set({ isLoadingDetail: true, error: null, currentNews: null });

      const response = await getNewsDetail(residentId, newsId);

      if (response.isSuccess && response.data) {
        set({
          currentNews: response.data,
          isLoadingDetail: false,
        });

        // Update the news item in the list to mark as read
        set((state) => ({
          newsList: state.newsList.map((item) =>
            item.id === newsId ? { ...item, isRead: true } : item,
          ),
        }));

        // Refresh unread count
        get().loadUnreadCount(residentId);
      } else {
        set({
          error: response.message || "Failed to load news detail",
          isLoadingDetail: false,
        });
      }
    } catch (error) {
      console.error("Error loading news detail:", error);
      set({
        error: "An error occurred while loading news detail",
        isLoadingDetail: false,
      });
    }
  },

  // Mark news as read
  markAsRead: async (residentId: string, newsId: number) => {
    try {
      const response = await markNewsAsRead(residentId, newsId);

      if (response.isSuccess) {
        // Update the news item in the list
        set((state) => ({
          newsList: state.newsList.map((item) =>
            item.id === newsId ? { ...item, isRead: true } : item,
          ),
        }));

        // Refresh unread count
        get().loadUnreadCount(residentId);
      }
    } catch (error) {
      console.error("Error marking news as read:", error);
    }
  },

  // Load unread count
  loadUnreadCount: async (residentId: string) => {
    try {
      const response = await getUnreadNewsCount(residentId);

      if (response.isSuccess && typeof response.data === "number") {
        const count = response.data;
        set({ unreadCount: count });

        // Update app badge
        await PushNotificationService.setBadgeCount(count);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  },

  // Clear news list
  clearNewsList: () => {
    set({
      newsList: [],
      currentPage: 0,
      totalPages: 0,
      hasMore: true,
      error: null,
    });
  },

  // Clear current news detail
  clearCurrentNews: () => {
    set({ currentNews: null });
  },
}));
