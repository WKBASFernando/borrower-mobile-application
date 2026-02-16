import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform, // Added for web support
} from "react-native";
import { Colors } from "../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";
import { router } from "expo-router"; // Added for editing

export const BorrowCard = ({ item }: any) => {
  const performDelete = async () => {
    try {
      await deleteDoc(doc(db, "lendings", item.id)); // Delete from Firestore
    } catch (error) {
      console.error("Delete failed: ", error);
      Alert.alert("Error", "Could not delete item.");
    }
  };

  const handleDelete = () => {
    const message = `Has "${item.friendName}" returned the item?`;

    // Fallback for Web as standard Alert often fails
    if (Platform.OS === "web") {
      if (window.confirm(message)) performDelete();
    } else {
      Alert.alert("Confirm Return", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: performDelete },
      ]);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.photo }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.friendName}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
          📍 {item.returnAddress}
        </Text>
        <Text style={styles.details}>⏰ {item.returnTime || "No time"}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <View style={styles.actions}>
        {/* Checkmark to mark as returned (Delete) */}
        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
          <Ionicons
            name="checkmark-done-circle"
            size={32}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    flexDirection: "row",
    padding: 15,
    marginBottom: 16,
    alignItems: "center",
    // Adding shadow for better UI
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: 70, height: 70, borderRadius: 15, backgroundColor: "#333" },
  info: { marginLeft: 15, flex: 1 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "bold" },
  details: { color: Colors.secondary || "#aaa", fontSize: 13, marginTop: 2 },
  date: { color: Colors.textSecondary, fontSize: 11, marginTop: 5 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    padding: 5,
  },
});
