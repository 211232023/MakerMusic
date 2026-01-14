import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUser } from "../src/UserContext";
import { useToast } from "../../contexts/ToastContext";
import { RootStackParamList } from "../src/types/navigation"; 
import { loginUser } from "../../services/api";

export default function LoginScreen() {
  const { login } = useUser();
  const { showError, showSuccess } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });

      if (response.token && response.user) {
        await login(response.user, response.token);
        showSuccess("Login realizado com sucesso!");
      } else {
        showError(response.message || "Email ou senha incorretos!");
      }
    } catch (error) {
      console.error("Falha no login:", error);
      showError("Não foi possível ligar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>MakerMusic</Text>

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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.linkButton}>
            <Text style={styles.registerText}>
              Esqueceu a senha? <Text style={styles.registerLink}>Recupere aqui</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkButton}>
            <Text style={styles.registerText}>
              Não tem uma conta? <Text style={styles.registerLink}>Cadastre-se como Aluno</Text>
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
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 600,
    alignItems: "center",
    paddingVertical: 40,
    alignSelf: 'center',
  },
  title: {
    color: "#f6e27f",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: "#333",
    color: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#444",
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  buttonText: {
    color: "#1c1b1f",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkButton: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  registerText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  registerLink: {
    color: "#d4af37",
    fontWeight: "bold",
  },
});