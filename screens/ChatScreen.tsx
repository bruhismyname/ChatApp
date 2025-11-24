import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView 
} from "react-native";
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
import { launchImageLibrary, Asset } from "react-native-image-picker"; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MessageType = {
  id: string;
  text: string;
  imageBase64?: string; // UBAH: simpan base64 langsung
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ navigation }: Props) {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const currentUser = auth.currentUser?.email || "Anonymous";

  const loadCachedMessages = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('chat_history');
      if (cachedData) {
        setMessages(JSON.parse(cachedData));
      }
    } catch (error) {
      console.log("Failed to load cache");
    }
  };

  useEffect(() => {
    loadCachedMessages();

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
      AsyncStorage.setItem('chat_history', JSON.stringify(list)).catch(console.error);
    });

    return () => unsub();
  }, []);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.3, // PENTING: Kompres gambar jadi kecil (max 30% quality)
      maxWidth: 800, // Resize max width 800px
      maxHeight: 800, // Resize max height 800px
      includeBase64: true, // Dapatkan base64
    });

    if (result.didCancel) return;
    if (result.errorMessage) {
      Alert.alert("Error", result.errorMessage);
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      uploadImageBase64(asset);
    }
  };

  // UPLOAD BASE64 KE FIRESTORE (TANPA STORAGE)
  const uploadImageBase64 = async (asset: Asset) => {
    if (!asset.base64) {
        Alert.alert("Error", "Gagal membaca gambar");
        return;
    }

    // Cek ukuran base64 (Firestore limit 1MB per document)
    const base64Size = (asset.base64.length * 3) / 4; // Hitung ukuran byte
    if (base64Size > 900000) { // 900KB (safety margin)
        Alert.alert(
          "Gambar Terlalu Besar", 
          "Pilih gambar yang lebih kecil atau foto ulang dengan kualitas rendah"
        );
        return;
    }
    
    setUploading(true);
    try {
      const imageData = `data:${asset.type};base64,${asset.base64}`;

      // Simpan langsung ke Firestore
      await addDoc(messagesCollection, {
        text: "📷 Image", 
        imageBase64: imageData, // Simpan base64 di Firestore
        user: currentUser,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Sukses", "Gambar berhasil dikirim!");

    } catch (error: any) {
      console.error("Upload Error:", error);
      
      if (error.code === 'invalid-argument') {
        Alert.alert("Gambar Terlalu Besar", "Pilih gambar yang lebih kecil");
      } else {
        Alert.alert("Upload Gagal", error.message || "Terjadi kesalahan");
      }
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await addDoc(messagesCollection, {
        text: message,
        user: currentUser, 
        createdAt: serverTimestamp(),
      });
      setMessage(""); 
    } catch (error: any) {
      console.error("Send Error:", error);
      Alert.alert("Error", "Gagal kirim pesan");
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
      
      {item.imageBase64 ? (
        <Image 
          source={{ uri: item.imageBase64 }} 
          style={styles.imageMsg} 
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.msgText}>{item.text}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>User:</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{currentUser}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
      />
      
      <View style={styles.inputRow}>
        <TouchableOpacity 
          onPress={handlePickImage} 
          style={styles.imgBtn} 
          disabled={uploading}
        >
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
          editable={!uploading}
        />
        
        {uploading ? (
           <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
        ) : (
           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
             <Text style={styles.sendButtonText}>KIRIM</Text>
           </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
    marginRight: 16,
    paddingRight: 8,
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
    flexShrink: 1,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
    flexShrink: 0,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  messageList: {
    padding: 10,
    paddingBottom: 20,
  },
  inputRow: { 
    flexDirection: "row", 
    padding: 10, 
    borderTopWidth: 1, 
    borderColor: "#ccc", 
    backgroundColor: '#fff', 
    alignItems: 'center' 
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
  imgBtn: { 
    marginRight: 10, 
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  cameraIcon: {
    fontSize: 24,
  },
  loader: {
    marginLeft: 10,
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
  },
  imageMsg: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  }
});