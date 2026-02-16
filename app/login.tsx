import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from "firebase/auth";
import { router } from "expo-router";
import { Colors } from "../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "697423123208-ov9i6f49rob6mnsvcdg2p6u8jegeof7e.apps.googleusercontent.com",
    androidClientId:
      "697423123208-ov9i6f49rob6mnsvcdg2p6u8jegeof7e.apps.googleusercontent.com",
    webClientId:
      "697423123208-ov9i6f49rob6mnsvcdg2p6u8jegeof7e.apps.googleusercontent.com",
  });

  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      try {
        const provider = new GoogleAuthProvider();
        // Standard Firebase web logic for web testing
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          router.replace("/(tabs)");
        }
      } catch (error: any) {
        console.error("Web Auth Error:", error.message);
        Alert.alert("Login Error", error.message);
      }
    } else {
      promptAsync(); // Mobile flow
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential); // Sign in with Firebase
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet" size={80} color={Colors.primary} />
        <Text style={styles.title}>Borrower</Text>
        <Text style={styles.subtitle}>
          Keep track of your lent items easily.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.googleBtn}
        disabled={!request}
        onPress={handleGoogleLogin}
      >
        <Ionicons
          name="logo-google"
          size={24}
          color="white"
          style={{ marginRight: 12 }}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Securely sign in to sync your data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "space-between",
    padding: 40,
    paddingVertical: 100,
  },
  header: {
    alignItems: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: "900",
    marginTop: 20,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  googleBtn: {
    flexDirection: "row",
    backgroundColor: "#4285F4", // Google Blue
    padding: 18,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  googleText: { color: "white", fontWeight: "bold", fontSize: 18 },
  footerText: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 12,
  },
});
