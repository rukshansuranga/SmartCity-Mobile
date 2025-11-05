import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn, _hasHydrated, selectedCouncil } = useAuthStore();

  // Wait for store to hydrate before making routing decisions
  if (!_hasHydrated) {
    return null;
  }

  console.log(
    "[Index] isSignedIn:",
    isSignedIn,
    "selectedCouncil:",
    selectedCouncil
  );

  // If not signed in, redirect to auth
  if (!isSignedIn) {
    console.log("[Index] Redirecting to /auth");
    return <Redirect href="/auth" />;
  }

  // If signed in but no council selected, redirect to council selection
  if (!selectedCouncil) {
    console.log("[Index] Redirecting to /selectCouncil");
    return <Redirect href="/selectCouncil" />;
  }

  // If signed in and council selected, redirect to home
  console.log("[Index] Redirecting to /home");
  return <Redirect href="/home" />;
}
