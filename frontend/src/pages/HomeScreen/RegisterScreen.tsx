import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUser } from "../src/UserContext";
import { RootStackParamList } from "../src/types/navigation";

export default function RegisterScreen() {
  const { register } = useUser();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(name, email, password);

      if (success) {
        Alert.alert("Sucesso", "Conta criada com sucesso! Você já pode fazer login.");
        navigation.goBack(); // ou navigation.replace("Login")
      } else {
        Alert.alert("Erro de Registro", "O email já está em uso ou ocorreu um erro.");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastre-se</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Criar Conta</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.loginText}>
          Já tem uma conta? <Text style={styles.loginLink}>Faça login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1c1b1f", padding: 20 },
  title: { color: "#f6e27f", fontSize: 32, fontWeight: "bold", marginBottom: 40 },
  input: { width: "100%", backgroundColor: "#333", color: "#fff", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: "#d4af37", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginTop: 20 },
  buttonText: { color: "#1c1b1f", fontWeight: "bold", fontSize: 18 },
  loginText: { color: "#fff", marginTop: 20, fontSize: 14 },
  loginLink: { color: "#d4af37", fontWeight: "bold" },
});
