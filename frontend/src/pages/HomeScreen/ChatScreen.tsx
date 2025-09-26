import React, { useState, useRef, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, ListRenderItemInfo 
} from "react-native";
import { useUser } from "../src/UserContext";

type Message = { 
  id: string; 
  sender: "Aluno" | "Professor"; 
  text: string;
};

export default function Chat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "Professor", text: "Olá, turma! Alguma dúvida?" },
    { id: "2", sender: "Aluno", text: "Olá, professor! Estou com dúvida sobre a escala maior." },
  ]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

  // Scroll automático ao enviar/receber mensagem
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const senderRole: "Aluno" | "Professor" = user?.role === "Aluno" ? "Aluno" : "Professor";
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: senderRole, text }]);
    setText("");
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    const isCurrentUserMessage = item.sender === (user?.role === "Aluno" ? "Aluno" : "Professor");

    return (
      <View
        style={[
          styles.messageItem,
          isCurrentUserMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.flatListContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem"
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 10 },
  flatListContent: { flexGrow: 1, justifyContent: "flex-end" },
  messageItem: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#d4af37",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: "#f6e27f",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },
  messageText: { color: "#1c1b1f", fontSize: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", paddingTop: 10 },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#d4af37",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: { color: "#1c1b1f", fontWeight: "bold", fontSize: 16 },
});
