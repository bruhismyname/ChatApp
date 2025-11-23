import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fungsi Login
  const handleLogin = async () => {
    console.log("Tombol Login Ditekan"); // <-- Cek apakah tombol berfungsi
    console.log("Email:", email, "Pass:", password);

    if (!email || !password) {
        Alert.alert("Error", "Email dan Password wajib diisi");
        return;
    }
    
    setLoading(true);
    try {
        console.log("Mencoba menghubungi Firebase..."); // <-- Cek koneksi
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Login Berhasil!"); 
    } catch (error: any) {
        console.error("Login Gagal Error:", error); // <-- Lihat error asli di terminal
        Alert.alert("Login Gagal", error.message);
    } finally {
        setLoading(false);
    }
  };

  // Fungsi Register (Daftar Akun Baru)
  const handleRegister = async () => {
    if (!email || !password) {
        Alert.alert("Error", "Isi email dan password untuk mendaftar");
        return;
    }
    setLoading(true);
    try {
        // Buat akun baru di Firebase
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
    } catch (error: any) {
        Alert.alert("Register Gagal", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat App</Text>
      
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="contoh@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="******"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.btnContainer}>
        <Button title={loading ? "Loading..." : "Login"} onPress={handleLogin} />
      </View>

      <TouchableOpacity onPress={handleRegister} style={{ marginTop: 15 }}>
        <Text style={{ color: 'blue', textAlign: 'center' }}>
            Belum punya akun? Daftar disini
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, textAlign: "center", marginBottom: 30, fontWeight: 'bold', color: '#333' },
  label: { marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  btnContainer: { marginTop: 10 }
});