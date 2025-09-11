import { postClient } from "@/api/clientAction";
import { useAuthStore } from "@/stores/authStore";
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { Button } from "react-native-paper";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { logIn } = useAuthStore();

  const redirectUri = makeRedirectUri({
    scheme: "smart-city",
    path: "signIn",
  });

  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KEYCLOAK_URL);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
      scopes: ["openid", "profile"],
      redirectUri: redirectUri,
    },
    discovery
  );

  const [registerRequest, registerResponse, promptRegisterAsync] =
    useAuthRequest(
      {
        clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
        scopes: ["openid", "profile"],
        redirectUri: redirectUri,
        extraParams: {
          kc_action: "register",
          prompt: "create",
        },
      },
      discovery
    );

  useEffect(() => {
    console.log("[DEBUG] useEffect triggered. response:", response);
    console.log("[DEBUG] request:", request);
    console.log("[DEBUG] redirectUri:", redirectUri);
    let isMounted = true;
    console.log("[DEBUG] SignIn component mounted.");
    const getToken = async ({ code, codeVerifier, redirectUri }) => {
      console.log("[DEBUG] getToken called with:", {
        code,
        codeVerifier,
        redirectUri,
      });
      try {
        const formData = {
          grant_type: "authorization_code",
          client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        };
        const formBody = [];
        for (const property in formData) {
          const encodedKey = encodeURIComponent(property);
          const encodedValue = encodeURIComponent(formData[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }
        console.log("[DEBUG] Token request body:", formBody.join("&"));
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody.join("&"),
          }
        );
        console.log("[DEBUG] tokenResponse.ok:", response.ok);
        if (response.ok) {
          const payload = await response.json();

          console.log("[DEBUG] Token payload:", payload);
          const userInfoResponse = await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${payload.access_token}`,
                Accept: "application/json",
              },
            }
          );
          console.log("[DEBUG] userInfoResponse.ok:", userInfoResponse.ok);
          const userInfo = await userInfoResponse.json();
          console.log("[DEBUG] userInfo:", userInfo);
          console.log("User ID (sub):", userInfo.sub); // <-- This is the user ID
          logIn({
            accessToken: payload.access_token,
            idToken: payload.id_token,
            userInfo: userInfo,
          });
          console.log("[DEBUG] logIn called.");
        }
      } catch (e) {
        console.warn("[DEBUG] getToken error:", e);
      }
    };
    console.log("[DEBUG] Auth response:", response);
    if (response?.type === "success") {
      // Handle successful login here
      const { code } = response.params;
      console.log("[DEBUG] Auth code received:", code, request?.codeVerifier);
      getToken({
        code,
        codeVerifier: request?.codeVerifier,
        redirectUri,
      });
      // [DEBUG] logIn is already called inside getToken
    } else {
      console.log("[DEBUG] response is not success or undefined.");
    }
    return () => {
      isMounted = false;
      console.log("[DEBUG] SignIn component unmounted.");
    };
  }, [response]);

  function handleLogin() {
    console.log("[DEBUG] handleLogin called. promptAsync:", promptAsync);

    promptAsync();
  }

  function handleRegister() {
    promptRegisterAsync();
  }

  //Handle registration response (same as login)
  useEffect(() => {
    console.log("registerResponse", registerResponse);
    const getToken = async ({ code, codeVerifier, redirectUri }) => {
      try {
        const formData = {
          grant_type: "authorization_code",
          client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        };
        const formBody = [];
        for (const property in formData) {
          const encodedKey = encodeURIComponent(property);
          const encodedValue = encodeURIComponent(formData[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }

        const tokenResponse = await fetch(
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody.join("&"),
          }
        );
        if (tokenResponse.ok) {
          const payload = await tokenResponse.json();

          const userInfoResponse = await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${payload.access_token}`,
                Accept: "application/json",
              },
            }
          );

          const userInfo = await userInfoResponse.json();
          alert("userinfo " + JSON.stringify(userInfo));
          await postClient({
            clientId: userInfo.sub,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            mobile: userInfo.mobile,
          });

          alert("logging in user: " + userInfo.sub); // <-- This is the user ID

          logIn({
            accessToken: payload.access_token,
            idToken: payload.id_token,
            userInfo: userInfo,
          });
        }
      } catch (e) {
        console.warn(e);
      }
    };

    if (registerResponse?.type === "success") {
      const { code } = registerResponse.params;
      console.log("Auth code:", code, registerRequest?.codeVerifier);
      getToken({
        code,
        codeVerifier: registerRequest?.codeVerifier,
        redirectUri,
      });
    }
  }, [registerResponse]);

  const getUserInfor = async (accessToken) => {
    try {
      const userResponse = await fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (userResponse.ok) {
        const userInfo = await userResponse.json();
        console.log("User ID (sub):", userInfo.sub); // <-- This is the user ID
        return userInfo;
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#c7f9cc] px-4">
      <View className="w-full flex flex-col gap-4">
        <View className="w-full rounded-xl shadow-md h-16 bg-[#22577a] flex justify-center items-center">
          <Button
            mode="contained"
            onPress={handleLogin}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 12,
            }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-xl text-center w-full text-white">
              Sign In
            </Text>
          </Button>
        </View>
        <View className="w-full rounded-xl shadow-md h-16 bg-[#38a3a5] flex justify-center items-center">
          <Button
            mode="contained"
            onPress={handleRegister}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 12,
            }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-xl text-center w-full text-white">
              Sign Up
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
