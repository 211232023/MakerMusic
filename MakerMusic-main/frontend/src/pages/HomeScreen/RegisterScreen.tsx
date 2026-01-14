import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/navigation";
import { registerUser } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showError, showSuccess } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);
    const userData = { name, email, password, role: "ALUNO" };

    try {
      const response = await registerUser(userData);
      if (response.userId) { 
        showSuccess("Conta de Aluno criada com sucesso! Você já pode fazer login.");
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        showError(response.message || "Ocorreu um erro ao criar a conta.");
      }
    } catch (error) {
      showError("Não foi possível ligar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Cadastre-se como Aluno</Text> 

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
              <Text style={styles.buttonText}>Criar Conta de Aluno</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
            <Text style={styles.loginText}>
              Já tem uma conta? <Text style={styles.loginLink}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1c1b1f", 
    width: '100%' 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  formContainer: { width: "100%", 
    alignItems: "center", 
    paddingVertical: 40, 
    maxWidth: 600, 
    alignSelf: 'center' 
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 40, 
    textAlign: "center" 
  },
  input: { 
    width: '100%', 
    backgroundColor: "#333", 
    color: "#fff", 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 15, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: "#444", 
    maxWidth: 600, 
    alignSelf: 'center' 
  },
  button: { 
    backgroundColor: "#d4af37", 
    padding: 18, 
    borderRadius: 12, 
    width: '100%', 
    maxWidth: 600,
    alignItems: "center", 
    marginTop: 20, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center'
  },
  buttonText: { 
    color: "#1c1b1f", 
    fontWeight: "bold", 
    fontSize: 18 
  },
  linkButton: { 
    marginTop: 20, 
    width: "100%", 
    alignItems: "center" 
  },
  loginText: { 
    color: "#fff", 
    fontSize: 14, 
    textAlign: "center" 
  },
  loginLink: { 
    color: "#d4af37", 
    fontWeight: "bold" 
  }
});
