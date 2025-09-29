import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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
  const { otherUserId, otherUserName } = route.params;

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
    if (!newMessage.trim() || !token) return;

    const messageText = newMessage;
    setNewMessage(''); // Limpa o input imediatamente

    const response = await sendMessage(otherUserId, messageText, token);

    if (response.messageId) {
      // Adiciona a nova mensagem à lista para uma atualização instantânea da UI
      const sentMessage: Message = {
        id: response.messageId.toString(),
        sender_id: user!.id,
        message_text: messageText,
        sent_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sentMessage]);
    } else {
      Alert.alert('Erro', response.message || 'Não foi possível enviar a mensagem.');
      setNewMessage(messageText); // Devolve o texto ao input em caso de erro
    }
  };
  
  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#d4af37" />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.header}>{otherUserName}</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender_id === user?.id ? styles.myMessage : styles.theirMessage
          ]}>
            <Text style={styles.messageText}>{item.message_text}</Text>
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
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f' },
    header: { color: '#f6e27f', fontSize: 22, fontWeight: 'bold', textAlign: 'center', padding: 15, backgroundColor: '#2a292e', marginTop: 40 },
    messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 15, marginVertical: 5, marginHorizontal: 10 },
    myMessage: { backgroundColor: '#d4af37', alignSelf: 'flex-end' },
    theirMessage: { backgroundColor: '#333', alignSelf: 'flex-start' },
    messageText: { color: '#fff', fontSize: 16 },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#2a292e' },
    input: { flex: 1, backgroundColor: '#1c1b1f', color: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
    sendButton: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 },
    sendButtonText: { color: '#d4af37', fontWeight: 'bold', fontSize: 16 },
});