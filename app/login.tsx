import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup, // Added this import
} from "firebase/auth";
import { router } from "expo-router";
import { Colors } from "../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "697423123208-ov9i6f49rob6mnsvcdg2p6u8jegeof7e.apps.googleusercontent.com",
    androidClientId:
      "697423123208-ov9i6f49rob6mnsvcdg2p6u8jegeof7e.apps.googleusercontent.com",
    webClientId:
      "697423123208-ov9i6f49rob6mnsvcdg2p6u8jegeof7e.apps.googleusercontent.com",
  });

  // Handle Google Login for both Web and Mobile
  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          router.replace("/(tabs)");
        }
      } catch (error: any) {
        console.error("Web Google Auth Error:", error.message);
        Alert.alert("Login Error", error.message);
      }
    } else {
      // Mobile uses the AuthSession flow
      promptAsync();
    }
  };

  // Listener for Mobile Google Auth response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  const handleEmailLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return Alert.alert("Error", "Please enter both email and password.");
    }

    if (cleanPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      // No need for router.replace here if you have onAuthStateChanged in _layout.tsx
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          Alert.alert("Success", "Account created!");
        } catch (signupError: any) {
          Alert.alert("Signup Error", signupError.message);
        }
      } else {
        Alert.alert("Login Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="wallet" size={60} color={Colors.primary} />
      <Text style={styles.title}>Borrower</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.loginText}>Sign In / Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={styles.googleBtn}
        disabled={!request}
        onPress={handleGoogleLogin} // FIXED: Now calling handleGoogleLogin instead of promptAsync
      >
        <Ionicons
          name="logo-google"
          size={20}
          color="white"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 30,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 40,
  },
  form: { gap: 15 },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 18,
    borderRadius: 15,
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: "#333" },
  dividerText: { color: "#666", marginHorizontal: 10 },
  googleBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#444",
    padding: 15,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  googleText: { color: Colors.text, fontWeight: "600" },
});

