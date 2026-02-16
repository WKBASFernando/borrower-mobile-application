import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function RootLayout() {
  useEffect(() => {
    // This is the "Gatekeeper" that watches for successful logins
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // As soon as the user logs in, force them to the home screen
        router.replace("/(tabs)");
      } else {
        // If they log out, send them back to login
        router.replace("/login");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-item" options={{ presentation: "modal" }} />
    </Stack>
  );
}
