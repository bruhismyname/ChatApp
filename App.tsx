import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen"; 
import ChatScreen from "./screens/ChatScreen";
import { auth, onAuthStateChanged } from "./firebase"; 
import { User } from "firebase/auth";

// Kita definisikan tipe navigasi
export type RootStackParamList = {
  Login: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // State untuk loading awal

  useEffect(() => {
    // Listener ini adalah KUNCI FITUR AUTO-LOGIN
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Cek Status User:", u ? "Ada User" : "Tidak Ada User");
      setUser(u);
      setLoading(false); // Matikan loading setelah status didapat
    });
    return () => unsub();
  }, []);

  // Tampilkan loading muter-muter saat aplikasi baru dibuka (cek login)
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // JIKA SUDAH LOGIN -> Langsung ke Chat (Tanpa bisa kembali ke Login)
          <Stack.Screen name="Chat" component={ChatScreen} />
        ) : (
          // JIKA BELUM LOGIN -> Tampilkan Login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}