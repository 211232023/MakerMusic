import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { resetPassword } from "../../services/api";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useToast } from "../../contexts/ToastContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../src/types/navigation";

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { showError, showSuccess } = useToast();
  
  // Captura o e-mail passado da tela anterior
  const { email } = route.params; 

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showError("Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({ token, newPassword });
      
      if (response.message) {
        showSuccess(response.message);
        setTimeout(() => {
          navigation.replace('Login');
        }, 1500);
      } else {
        showError("Não foi possível redefinir a senha.");
      }
      
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      showError("Não foi possível conectar ao servidor.");
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redefinir Senha</Text>
      <Text style={styles.subtitle}>
        Insira o código enviado para {email} e sua nova senha.
      </Text>

      <TextInput
        placeholder="Código de Recuperação (Token)"
        placeholderTextColor="#aaa"
        value={token}
        onChangeText={setToken}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Nova Senha"
        placeholderTextColor="#aaa"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        secureTextEntry
      />

      <TextInput
        placeholder="Confirmar Nova Senha"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Redefinir Senha</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.backToLoginText}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Use os mesmos estilos do ForgotPasswordScreen para consistência
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1b1f",
    padding: 20,
  },
  title: {
    color: "#f6e27f",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
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
  button: {
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
    fontSize: 18,
  },
  backToLoginText: {
    color: "#d4af37",
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  }
});