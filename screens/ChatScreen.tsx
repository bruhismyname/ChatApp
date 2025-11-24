import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from "react-native";
import { 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  messagesCollection,
  auth,        
  signOut      
} from "../firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage"; // [BARU] Import ini

// Tipe data pesan
type MessageType = {
  id: string;
  text: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ navigation }: Props) {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  
  const currentUser = auth.currentUser?.email || "Anonymous";

  // [BARU] Fungsi Load Cache
  const loadCachedMessages = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('chat_history');
      if (cachedData) {
        const parsedMessages = JSON.parse(cachedData);
        setMessages(parsedMessages);
        console.log("Loaded from cache:", parsedMessages.length, "messages");
      }
    } catch (error) {
      console.log("Failed to load cache", error);
    }
  };

  useEffect(() => {
    // 1. Coba load data lokal dulu (supaya cepat muncul)
    loadCachedMessages();

    // 2. Subscribe ke Firebase (untuk data live & update cache)
    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });
      
      // Update State Tampilan
      setMessages(list);

      // [BARU] Simpan data terbaru ke Local Storage
      AsyncStorage.setItem('chat_history', JSON.stringify(list))
        .catch(err => console.error("Gagal simpan cache:", err));
    });

    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await addDoc(messagesCollection, {
        text: message,
        user: currentUser, 
        createdAt: serverTimestamp(),
      });
      setMessage(""); 
    } catch (error) {
      console.error("Gagal kirim pesan:", error);
      Alert.alert("Error", "Gagal mengirim pesan. Cek koneksi internet.");
    }
  };

  const handleLogout = async () => {
    try {
      // [OPSIONAL] Bersihkan history chat saat logout jika diinginkan
      // await AsyncStorage.removeItem('chat_history'); 
      await signOut(auth);
    } catch (error: any) {
      Alert.alert("Error Logout", error.message);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => (
    <View style={[
        styles.msgBox,
        item.user === currentUser ? styles.myMsg : styles.otherMsg
    ]}>
      <Text style={styles.sender}>{item.user}</Text>
      <Text style={styles.msgText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>User: {currentUser}</Text>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
      />
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Kirim" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
  },
  headerText: { fontWeight: 'bold', maxWidth: '70%' },
  inputRow: { 
    flexDirection: "row", 
    padding: 10, 
    borderTopWidth: 1, 
    borderColor: "#ccc", 
    backgroundColor: '#fff' 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: "#ccc", 
    marginRight: 10, 
    padding: 8, 
    borderRadius: 20, 
    paddingHorizontal: 15,
    backgroundColor: '#fff'
  },
  msgBox: { 
    padding: 10, 
    marginVertical: 4, 
    borderRadius: 10, 
    maxWidth: "80%" 
  },
  myMsg: { 
    backgroundColor: "#d1f0ff", 
    alignSelf: "flex-end",
    borderBottomRightRadius: 0
  },
  otherMsg: { 
    backgroundColor: "#ffffff", 
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#eee'
  },
  sender: { fontSize: 10, fontWeight: "bold", marginBottom: 2, color: '#888' },
  msgText: { fontSize: 16, color: '#333' }
});