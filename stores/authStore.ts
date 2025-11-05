import { Council, KeycloakUserInfo } from "@/types";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  isSignedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  tokenExpiresAt: number | null;
  userInfo: KeycloakUserInfo | null;
  councils: Council[] | null;
  selectedCouncil: Council | null;

  _hasHydrated: boolean;
  logIn: (token: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
    userInfo: KeycloakUserInfo;
  }) => void;
  logOut: () => void;
  setHasHydrated: (value: boolean) => void;
  setCouncils: (councils: Council[]) => void;
  setSelectedCouncil: (council: Council) => void;
  updateTokens: (token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => void;
  isTokenExpired: () => boolean;
};

export const useAuthStore = create(
  persist<UserState>(
    (set, get) => ({
      isSignedIn: false,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      tokenExpiresAt: null,
      userInfo: null,
      councils: null,
      selectedCouncil: null,

      _hasHydrated: false,

      logIn: (token: {
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
        userInfo: any;
      }) => {
        set((state) => {
          console.log("Logging in with token:", token);
          const expiresAt = Date.now() + token.expiresIn * 1000;
          return {
            ...state,
            isSignedIn: true,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            idToken: token.idToken,
            tokenExpiresAt: expiresAt,
            userInfo: token.userInfo,
          };
        });
      },

      logOut: async () => {
        console.log("Logging out...");
        await deleteItemAsync("auth-store");
        set((state) => ({
          ...state,
          accessToken: null,
          refreshToken: null,
          idToken: null,
          tokenExpiresAt: null,
          userInfo: null,
          councils: null,
          selectedCouncil: null,
          isSignedIn: false,
        }));
      },

      setHasHydrated: (value: boolean) => {
        set((state) => ({
          ...state,
          _hasHydrated: value,
        }));
      },

      setCouncils: (councils: Council[]) => {
        set((state) => ({
          ...state,
          councils,
        }));
      },

      setSelectedCouncil: (council: Council) => {
        console.log("Setting selected council:", council);
        set((state) => ({
          ...state,
          selectedCouncil: council,
        }));
      },

      updateTokens: (token: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }) => {
        const expiresAt = Date.now() + token.expiresIn * 1000;
        console.log("Updating tokens, new expiry:", new Date(expiresAt));
        set((state) => ({
          ...state,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          tokenExpiresAt: expiresAt,
        }));
      },

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return true;
        // Consider token expired 5 minutes before actual expiry
        const bufferTime = 5 * 60 * 1000; // 5 minutes in ms
        return Date.now() >= tokenExpiresAt - bufferTime;
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => ({
        setItem: setItemAsync,
        getItem: getItemAsync,
        removeItem: deleteItemAsync,
      })),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
