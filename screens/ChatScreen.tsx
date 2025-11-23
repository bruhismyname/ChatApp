import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView } from "react-native";
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

  useEffect(() => {
    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });
      setMessages(list);
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
      Alert.alert("Error", "Gagal mengirim pesan");
    }
  };

  const handleLogout = async () => {
    try {
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
    <SafeAreaView style={styles.container}>
      {/* HEADER YANG DIPERBAIKI */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>User:</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{currentUser}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT LIST */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
      />
      
      {/* INPUT AREA */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>KIRIM</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // HEADER STYLES - UBAH BAGIAN INI
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 35,        // UBAH DARI 12 JADI 16 (atau lebih)
    paddingBottom: 12,     // TAMBAHKAN INI
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,       // UBAH DARI 10 JADI 16
    paddingRight: 8,       // TAMBAHKAN INI
  },
  userLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 6,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flexShrink: 1,         // TAMBAHKAN INI
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 18, // UBAH DARI 16 JADI 18
    paddingVertical: 10,   // UBAH DARI 8 JADI 10
    borderRadius: 6,
    flexShrink: 0,         // TAMBAHKAN INI
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  // MESSAGE LIST
  messageList: {
    padding: 10,
    paddingBottom: 20,
  },
  // INPUT AREA
  inputRow: { 
    flexDirection: "row", 
    padding: 10, 
    borderTopWidth: 1, 
    borderColor: "#ccc", 
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: "#ccc", 
    marginRight: 10, 
    padding: 10, 
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // MESSAGE BUBBLES
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
  sender: { 
    fontSize: 10, 
    fontWeight: "bold", 
    marginBottom: 2, 
    color: '#888' 
  },
  msgText: {
    fontSize: 16,
    color: '#333'
  }
});