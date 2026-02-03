import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { forgotPassword } from "../frontend/src/services/api";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "../frontend/src/contexts/ToastContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../frontend/src/pages/src/types/navigation";
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>>();
  const { showError, showSuccess, showWarning } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showError("Por favor, digite seu e-mail.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.message === 'Token enviado!') {
          showSuccess("Token enviado para o seu e-mail!");
          setTimeout(() => { 
            navigation.navigate('ResetPassword', { email: email }); 
          }, 1500);
      } else {
          showWarning(response.message || "Erro ao processar solicitação.");
      }
    } catch (error) { 
      showError("Não foi possível conectar ao servidor."); 
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="arrow-back" size={28} color="#f6e27f" />
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>Digite seu e-mail para receber o token de redefinição.</Text>

        <TextInput
          placeholder="Digite seu e-mail"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {isLoading ? (
          <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
            <Text style={styles.buttonText}>Enviar Token</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#1c1b1f", 
    padding: 20, 
    width: '100%' 
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 600, 
    alignSelf: 'center', 
    alignItems: 'center' 
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  subtitle: { 
    color: "#fff", 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 30 
  },
  input: { 
    width: '100%', 
    backgroundColor: "#333", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    fontSize: 16 
  },
  button: { 
    backgroundColor: "#d4af37", 
    padding: 15, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: "center", 
    marginTop: 20 
  },
  buttonText: { 
    color: "#1c1b1f", 
    fontWeight: "bold", 
    fontSize: 18 
  }
});