import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Redefinir Senha</Text>
          <Text style={styles.subtitle}>
            Insira o código enviado para <Text style={{ fontWeight: 'bold', color: '#d4af37' }}>{email}</Text> e sua nova senha.
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

          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.linkButton}>
            <Text style={styles.backToLoginText}>Voltar para o Login</Text>
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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
  backToLoginText: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: 'bold',
  }
});