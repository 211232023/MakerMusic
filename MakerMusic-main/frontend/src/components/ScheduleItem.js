import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, KeyboardAvoidingView, Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const handleSave = () => {
    if (!day.trim() || !time.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const newSchedule = {
      id: Math.random().toString(),
      day,
      time,
    };

    // Passa o novo horário para a tela anterior
    navigation.navigate("Horarios", { newSchedule });

    // Não precisa do goBack(), o navigate já mantém a pilha correta
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Adicionar Horário</Text>

      <TextInput
        style={styles.input}
        placeholder="Dia da semana (ex: Terça-feira)"
        placeholderTextColor="#aaa"
        value={day}
        onChangeText={setDay}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Horário (ex: 15:00 - 16:00)"
        placeholderTextColor="#aaa"
        value={time}
        onChangeText={setTime}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1c1b1f", 
    padding: 20, 
    justifyContent: "center" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#f6e27f", 
    marginBottom: 30, 
    textAlign: "center" 
  },
  input: {
    width: "100%",
    backgroundColor: "#333",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#d4af37",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#1c1b1f",
    fontWeight: "bold",
    fontSize: 16,
  },
});
