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
  SafeAreaView,
  Modal,
  Dimensions 
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type MessageType = {
  id: string;
  text: string;
  imageBase64?: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ navigation }: Props) {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const currentUser = auth.currentUser?.displayName || auth.currentUser?.email || "Anonymous";

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
      quality: 0.3,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: true,
    });

    if (result.didCancel) return;
    if (result.errorMessage) {
      Alert.alert("Error", result.errorMessage);
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      const imageData = `data:${asset.type};base64,${asset.base64}`;
      setPreviewImage(imageData);
      setSelectedImage(asset);
      setShowPreviewModal(true);
    }
  };

  const confirmSendImage = async () => {
    if (!selectedImage || !previewImage) return;
    
    setShowPreviewModal(false);
    uploadImageBase64(selectedImage);
    
    setPreviewImage(null);
    setSelectedImage(null);
  };

  const cancelPreview = () => {
    setShowPreviewModal(false);
    setPreviewImage(null);
    setSelectedImage(null);
  };

  const uploadImageBase64 = async (asset: Asset) => {
    if (!asset.base64) {
        Alert.alert("Error", "Gagal membaca gambar");
        return;
    }

    const base64Size = (asset.base64.length * 3) / 4;
    if (base64Size > 900000) {
        Alert.alert(
          "Gambar Terlalu Besar", 
          "Pilih gambar yang lebih kecil"
        );
        return;
    }
    
    setUploading(true);
    try {
      const imageData = `data:${asset.type};base64,${asset.base64}`;

      await addDoc(messagesCollection, {
        text: "📷 Image", 
        imageBase64: imageData,
        user: currentUser,
        createdAt: serverTimestamp(),
      });

    } catch (error: any) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Gagal", error.message || "Terjadi kesalahan");
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
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === currentUser;
    
    return (
      <View style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper
      ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.user}</Text>
        )}
        
        <View style={[
          styles.msgBox,
          isMyMessage ? styles.myMsg : styles.otherMsg
        ]}>
          {item.imageBase64 ? (
            <TouchableOpacity onPress={() => setFullScreenImage(item.imageBase64!)}>
              <Image 
                source={{ uri: item.imageBase64 }} 
                style={styles.imageMsg} 
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <Text style={[styles.msgText, isMyMessage && styles.myMsgText]}>{item.text}</Text>
          )}
          
          <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

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
        showsVerticalScrollIndicator={false}
      />
      
      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.uploadingText}>Mengirim gambar...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          onPress={handlePickImage} 
          style={styles.cameraButton} 
          disabled={uploading}
        >
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          editable={!uploading}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() && !uploading) && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!message.trim() || uploading}
        >
          <Text style={styles.sendButtonText}>KIRIM</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelPreview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Preview Gambar</Text>
              <TouchableOpacity onPress={cancelPreview}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {previewImage && (
              <Image 
                source={{ uri: previewImage }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelPreview}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmSendImage}>
                <Text style={styles.confirmButtonText}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={fullScreenImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity 
            style={styles.closeFullScreen} 
            onPress={() => setFullScreenImage(null)}
          >
            <Text style={styles.closeFullScreenText}>✕</Text>
          </TouchableOpacity>
          
          {fullScreenImage && (
            <Image 
              source={{ uri: fullScreenImage }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingTop: 40, 
    paddingBottom: 16,
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
    color: '#fff',
    marginRight: 6,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
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
    padding: 12,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
    fontWeight: '500',
  },
  msgBox: {
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
  },
  myMsg: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 0,
  },
  otherMsg: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  msgText: {
    fontSize: 15,
    color: '#000',
    marginBottom: 4,
  },
  myMsgText: {
    color: '#fff', 
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: '#E3F2FD', 
  },
  imageMsg: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderTopWidth: 1,
    borderColor: '#4A90E2',
  },
  uploadingText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontSize: 13,
  },
  
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  cameraButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cameraIcon: {
    fontSize: 28,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4A90E2',
    borderBottomWidth: 1,
    borderColor: '#3A7BC8',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  previewImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: '#000',
  },
  previewActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreen: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreenText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});