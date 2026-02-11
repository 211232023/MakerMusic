import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Image, Alert, Linking, Dimensions
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getChatHistory, sendMessage, uploadChatFile } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { RootStackParamList } from '../src/types/navigation';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from '../../components/AudioPlayer';
import AudioRecorder from '../../components/AudioRecorder';
import VideoPlayer from '../../components/VideoPlayer';
import { BASE_FILES_URL } from '../../config/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isLargeScreen = SCREEN_WIDTH > 768;

type Message = {
  id: string;
  sender_id: number;
  message_text: string;
  message_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  sent_at: string;
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const { user, token } = useUser();
  const { showError } = useToast();
  const otherUserId = Number(route.params.otherUserId);
  const { otherUserName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const BASE_URL_FILES = BASE_FILES_URL;

  const fetchHistory = useCallback(async () => {
    if (token) {
      setIsLoading(true);
      try {
        const history = await getChatHistory(otherUserId, token);
        if (Array.isArray(history)) {
          setMessages(history);
        }
      } catch (error) {
        showError('Não foi possível carregar as mensagens.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [token, otherUserId]);

  useFocusEffect(useCallback(() => {
    fetchHistory();
  }, [fetchHistory]));

  const handleSend = async (text?: string, fileData?: any) => {
    if ((!text?.trim() && !fileData) || !token || !user) return;
    
    const messageText = text || '';
    if (!fileData) setNewMessage('');

    const tempId = Math.random().toString();
    const sentMessage: Message = {
      id: tempId,
      sender_id: user.id,
      message_text: messageText,
      message_type: fileData?.type || 'TEXT',
      file_url: fileData?.url,
      file_name: fileData?.name,
      sent_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, sentMessage]);

    const extraData = fileData ? {
      messageType: fileData.type,
      fileUrl: fileData.url,
      fileName: fileData.name,
      fileSize: fileData.size
    } : {};

    try {
      const response = await sendMessage(otherUserId, messageText, token, extraData);
      if (!response.messageId) {
        showError('Não foi possível enviar a mensagem.');
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        if (!fileData) setNewMessage(messageText);
      }
    } catch (error) {
      showError('Erro ao enviar mensagem.');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const uploadAndSend = async (file: any, type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE', text: string) => {
    setIsUploading(true);
    try {
      const result = await uploadChatFile(file, token!);
      if (result.fileUrl) {
        let fileName = result.fileName;
        try {
          fileName = decodeURIComponent(escape(result.fileName));
        } catch (e) {}

        await handleSend(text, {
          type: type,
          url: result.fileUrl,
          name: fileName,
          size: result.fileSize
        });
        setPendingFile(null);
        setNewMessage('');
      } else {
        showError(result.message || 'Erro no upload.');
      }
    } catch (error) {
      showError('Erro ao conectar ao servidor.');
    } finally {
      setIsUploading(false);
    }
  };

  const onRecordingComplete = (uri: string, duration: number) => {
    setPendingFile({
      uri,
      name: `audio_${Date.now()}.m4a`,
      type: 'audio/m4a',
      chatType: 'AUDIO',
      size: 0
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'audio/*', 'video/*', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const file = result.assets[0];
        let type: any = 'FILE';
        const mime = file.mimeType?.toLowerCase() || '';
        
        if (mime.startsWith('audio')) type = 'AUDIO';
        else if (mime.startsWith('video')) type = 'VIDEO';
        else if (mime.startsWith('image')) type = 'IMAGE';
        
        setPendingFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
          chatType: type
        });
      }
    } catch (err) {
      showError('Erro ao selecionar arquivo.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        
        setPendingFile({
          uri: asset.uri,
          name: asset.fileName || (isVideo ? `vid_${Date.now()}.mp4` : `img_${Date.now()}.jpg`),
          type: isVideo ? 'video/mp4' : 'image/jpeg',
          size: asset.fileSize || 0,
          chatType: isVideo ? 'VIDEO' : 'IMAGE'
        });
      }
    } catch (err) {
      showError('Erro ao abrir galeria.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#f6e27f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{otherUserName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{otherUserName}</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatArea}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.messagesContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item.id.toString() + index}
              style={styles.messageList}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 15 }}
              renderItem={({ item }) => {
                const isVideo = item.message_type === 'VIDEO' || 
                  (item.file_name && (item.file_name.toLowerCase().endsWith('.mp4') || 
                  item.file_name.toLowerCase().endsWith('.mov') || 
                  item.file_name.toLowerCase().endsWith('.m4v') || 
                  item.file_name.toLowerCase().endsWith('.3gp') || 
                  item.file_name.toLowerCase().endsWith('.mkv')
                ));
                
                const isAudio = item.message_type === 'AUDIO' || 
                  (item.file_name && (item.file_name.toLowerCase().endsWith('.mp3') || 
                  item.file_name.toLowerCase().endsWith('.wav') || 
                  item.file_name.toLowerCase().endsWith('.m4a')
                ));
                
                const isImage = item.message_type === 'IMAGE';

                return (
                  <View style={[
                    styles.messageBubble,
                    item.sender_id === user?.id ? styles.myMessage : styles.theirMessage
                  ]}>
                    {isVideo && item.file_url ? (
                      <VideoPlayer 
                        url={`${BASE_URL_FILES}${item.file_url}`} 
                        fileName={item.file_name}
                      />
                    ) : isImage && item.file_url ? (
                      <TouchableOpacity 
                        onPress={() => Linking.openURL(`${BASE_URL_FILES}${item.file_url}`)}
                        style={styles.imageWrapper}
                      >
                        <Image 
                          source={{ uri: `${BASE_URL_FILES}${item.file_url}` }} 
                          style={styles.messageImage} 
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : isAudio && item.file_url ? (
                      <View style={styles.audioWrapper}>
                        <AudioPlayer url={`${BASE_URL_FILES}${item.file_url}`} />
                      </View>
                    ) : item.message_type === 'FILE' && item.file_url ? (
                      <TouchableOpacity 
                        style={styles.fileContainer} 
                        onPress={() => Linking.openURL(`${BASE_URL_FILES}${item.file_url}`)}
                      >
                        <View style={[styles.fileIconCircle, { backgroundColor: item.sender_id === user?.id ? 'rgba(0,0,0,0.1)' : 'rgba(212,175,55,0.2)' }]}>
                          <Ionicons name="document-text" size={22} color={item.sender_id === user?.id ? "#1c1b1f" : "#f6e27f"} />
                        </View>
                        <Text style={[styles.fileName, { color: item.sender_id === user?.id ? "#1c1b1f" : "#fff" }]} numberOfLines={1}>
                          {item.file_name || 'Arquivo'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.message_text ? (
                      <Text style={item.sender_id === user?.id ? styles.myMessageText : styles.theirMessageText}>
                        {item.message_text}
                      </Text>
                    ) : null}
                    
                    <View style={styles.messageFooter}>
                      <Text style={[styles.messageTime, { color: item.sender_id === user?.id ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)' }]}>
                        {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {item.sender_id === user?.id && (
                        <Ionicons name="checkmark-done" size={16} color="rgba(0,0,0,0.45)" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                  </View>
                );
              }}
              onContentSizeChange={() => {}}
              onLayout={() => {
                if (messages.length > 0) {
                  setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
                }
              }}
              inverted={false}
            />
          </View>

          {pendingFile && (
            <View style={styles.previewContainer}>
              <View style={styles.previewContent}>
                <View style={styles.previewIconBox}>
                  {pendingFile.chatType === 'IMAGE' ? (
                    <Image source={{ uri: pendingFile.uri }} style={styles.previewThumb} />
                  ) : (
                    <Ionicons name={pendingFile.chatType === 'AUDIO' ? "mic" : (pendingFile.chatType === 'VIDEO' ? "videocam" : "document")} size={24} color="#f6e27f" />
                  )}
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewLabel}>Anexar {pendingFile.chatType.toLowerCase()}</Text>
                  <Text style={styles.previewName} numberOfLines={1}>{pendingFile.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setPendingFile(null)} style={styles.closePreview}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputArea}>
            <View style={styles.inputMainRow}>
              <View style={styles.inputCard}>
                <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                  <Ionicons name="camera" size={24} color="#999" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.input}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Mensagem"
                  placeholderTextColor="#999"
                  textAlignVertical="center"
                />
                
                <TouchableOpacity style={styles.iconButton} onPress={pickDocument}>
                  <Ionicons name="attach" size={26} color="#999" style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              </View>

              <View style={styles.sendActionWrapper}>
                {isUploading ? (
                  <View style={styles.sendCircle}>
                    <ActivityIndicator color="#1c1b1f" size="small" />
                  </View>
                ) : (
                  newMessage.trim() || pendingFile ? (
                    <TouchableOpacity 
                      style={styles.sendCircle} 
                      onPress={() => pendingFile ? uploadAndSend(pendingFile, pendingFile.chatType, newMessage) : handleSend(newMessage)}
                    >
                      <Ionicons name="send" size={22} color="#1c1b1f" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.recorderWrapper}>
                      <AudioRecorder onRecordingComplete={onRecordingComplete} />
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  mainWrapper: {
    flex: 1,
    alignSelf: 'center',
    width: isLargeScreen ? '90%' : '100%',
    maxWidth: 1000,
    backgroundColor: '#1c1b1f',
    overflow: 'hidden',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#333',
    borderRadius: isLargeScreen ? 15 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#2a292e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6e27f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#16151a',
    overflow: 'hidden',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 15,
    ...Platform.select({
      web: {
        overflowY: 'auto' as any,
      }
    }),
  },
  messageBubble: {
    maxWidth: isLargeScreen ? '60%' : '85%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 4,
    minWidth: 60,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  myMessage: {
    backgroundColor: '#f6e27f',
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  theirMessage: {
    backgroundColor: '#2a292e',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },
  myMessageText: {
    color: '#1c1b1f',
    fontSize: 15,
    lineHeight: 20,
  },
  theirMessageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  imageWrapper: {
    marginBottom: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageImage: {
    width: 250,
    height: 250,
    backgroundColor: '#333',
  },
  audioWrapper: {
    width: 220,
    marginBottom: 5,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 5,
  },
  fileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  previewContainer: {
    padding: 10,
    backgroundColor: '#1c1b1f',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 12,
    padding: 8,
  },
  previewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1c1b1f',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewLabel: {
    color: '#f6e27f',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  previewName: {
    color: '#fff',
    fontSize: 13,
  },
  closePreview: {
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
  },
  inputArea: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#1c1b1f',
  },
  inputMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginRight: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 0,
    height: 48,
    textAlignVertical: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
  },
  sendActionWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f6e27f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recorderWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a292e',
    justifyContent: 'center',
    alignItems: 'center',
  }
});