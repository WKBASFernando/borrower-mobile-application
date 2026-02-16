import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// Added 'where' to the firestore imports
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig"; // Added auth import
import { Colors } from "../../constants/Theme";
import { BorrowCard } from "../../components/BorrowCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HomeScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 1. Get the currently logged-in user
    const user = auth.currentUser;

    // 2. If no user is logged in, don't run the query
    if (!user) return;

    // 3. Update query to filter by userId
    const q = query(
      collection(db, "lendings"),
      where("userId", "==", user.uid), // ONLY fetch items for this user
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: any = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(docs);
      },
      (error) => {
        // If you see an error here, check your Firestore Indices
        console.error("Firestore Query Error:", error);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Lent History</Text>
        <TouchableOpacity onPress={() => auth.signOut()}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => <BorrowCard item={item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No items found. Tap + to add one!
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-item")}
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "800",
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: Colors.primary,
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
});
