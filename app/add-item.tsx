import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { db, auth } from "../firebaseConfig"; // Added auth import
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Colors } from "../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

export default function AddItemScreen() {
  const [name, setName] = useState("");
  const [returnAddress, setReturnAddress] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Access denied", "Camera permission required.");

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled)
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const handleSave = async () => {
    // 1. Check if user is logged in before saving
    const user = auth.currentUser;
    if (!user) {
      return Alert.alert("Error", "You must be logged in to save items.");
    }

    if (!name || !image || !returnAddress)
      return Alert.alert("Missing Info", "Please fill all fields.");

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const loc =
        status === "granted"
          ? await Location.getCurrentPositionAsync({})
          : null;

      // 2. Add userId to the document to enable per-user filtering
      await addDoc(collection(db, "lendings"), {
        userId: user.uid, // This is the unique key for this user
        friendName: name,
        photo: image,
        returnAddress,
        returnTime,
        locationName: loc
          ? `Lat: ${loc.coords.latitude.toFixed(2)}, Lon: ${loc.coords.longitude.toFixed(2)}`
          : "Unknown",
        date: new Date().toLocaleDateString(),
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success", "Lending logged!");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Lending</Text>

      <TouchableOpacity style={styles.imagePlaceholder} onPress={takePhoto}>
        {image ? (
          <Image source={{ uri: image }} style={styles.fullImage} />
        ) : (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="camera" size={50} color={Colors.textSecondary} />
            <Text style={{ color: Colors.textSecondary, marginTop: 5 }}>
              Take a Photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Friend's Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Return Address"
          placeholderTextColor="#666"
          value={returnAddress}
          onChangeText={setReturnAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Return Time (e.g. 8:00 PM)"
          placeholderTextColor="#666"
          value={returnTime}
          onChangeText={setReturnTime}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveBtnText}>Confirm Lending</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 25 },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 40,
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  fullImage: { width: "100%", height: "100%" },
  form: { gap: 15 },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 18,
    borderRadius: 18,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 18 },
});
