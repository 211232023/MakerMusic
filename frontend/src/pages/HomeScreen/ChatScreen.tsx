import React, { useState, useCallback, useRef } from 'react';
// --- MUDANÇA 1: Importar SafeAreaView e Alert ---
import { 
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, SafeAreaView 
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getChatHistory, sendMessage } from '../../services/api';
import { RootStackParamList } from '../src/types/navigation';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

type Message = {
  id: string;
  sender_id: number;
  message_text: string;
  sent_at: string;
};

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const { user, token } = useUser();
  const otherUserId = Number(route.params.otherUserId);
  const { otherUserName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchHistory = useCallback(async () => {
    if (token) {
      try {
        const history = await getChatHistory(otherUserId, token);
        if (Array.isArray(history)) {
          setMessages(history);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as mensagens.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [token, otherUserId]);

  useFocusEffect(useCallback(() => {
    fetchHistory();
  }, [fetchHistory]));

  const handleSend = async () => {
    if (!newMessage.trim() || !token || !user) return;

    const messageText = newMessage;
    setNewMessage('');

    const response = await sendMessage(otherUserId, messageText, token);

    if (response.messageId) {
      const sentMessage: Message = {
        id: response.messageId.toString(),
        sender_id: user.id,
        message_text: messageText,
        sent_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sentMessage]);
    } else {
      Alert.alert('Erro', response.message || 'Não foi possível enviar a mensagem.');
      setNewMessage(messageText);
    }
  };
  
  if (isLoading) {
    return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#d4af37" />
        </SafeAreaView>
    );
  }

  return (
    // --- MUDANÇA 2: Usar SafeAreaView como container principal ---
    <SafeAreaView style={styles.container}>
      {/* O KeyboardAvoidingView agora envolve apenas o conteúdo que precisa de se mover */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        // --- MUDANÇA 3: Remover o offset fixo, o 'padding' behavior é mais eficaz com o SafeAreaView ---
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} 
      >
        <Text style={styles.header}>{otherUserName}</Text>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messageList}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.sender_id === user?.id ? styles.myMessage : styles.theirMessage
            ]}>
              <Text style={item.sender_id === user?.id ? styles.myMessageText : styles.theirMessageText}>
                {item.message_text}
              </Text>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f' },
    keyboardAvoidingContainer: { flex: 1 },
    header: { 
      color: '#f6e27f', 
      fontSize: 22, 
      fontWeight: 'bold', 
      textAlign: 'center', 
      paddingVertical: 15,
      backgroundColor: '#2a292e',
    },
    messageList: {
        flex: 1,
        paddingHorizontal: 10,
    },
    messageBubble: { 
        maxWidth: '80%', 
        padding: 12, 
        borderRadius: 18, 
        marginVertical: 5,
    },
    myMessage: { 
        backgroundColor: '#d4af37', 
        alignSelf: 'flex-end' 
    },
    theirMessage: { 
        backgroundColor: '#333', 
        alignSelf: 'flex-start' 
    },
    myMessageText: { 
        color: '#1c1b1f', 
        fontSize: 16 
    },
    theirMessageText: { 
        color: '#fff', 
        fontSize: 16 
    },
    inputContainer: { 
        flexDirection: 'row', 
        padding: 10, 
        borderTopWidth: 1, 
        borderTopColor: '#333', 
        backgroundColor: '#2a292e' 
    },
    input: { 
        flex: 1, 
        backgroundColor: '#1c1b1f', 
        color: '#fff', 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        marginRight: 10,
        fontSize: 16
    },
    sendButton: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 15 
    },
    sendButtonText: { 
        color: '#d4af37', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
});