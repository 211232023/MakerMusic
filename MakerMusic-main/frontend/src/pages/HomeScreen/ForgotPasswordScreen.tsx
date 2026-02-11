import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { forgotPassword } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "../../contexts/ToastContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../src/types/navigation";
import { Ionicons } from '@expo/vector-icons';
import Logo from "../../components/Logo";

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Logo size="large" />
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={60} color="#f6e27f" />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="mail-outline" size={28} color="#64b5f6" />
                <Text style={styles.cardTitle}>Recuperar Senha</Text>
              </View>

              <Text style={styles.subtitle}>
                Digite seu e-mail cadastrado para receber o token de redefinição de senha.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    placeholder="seu@email.com"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f6e27f" />
                  <Text style={styles.loadingText}>Enviando token...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleForgotPassword}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send-outline" size={20} color="#1c1b1f" />
                  <Text style={styles.buttonText}>Enviar Token</Text>
                </TouchableOpacity>
              )}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#64b5f6" />
                <Text style={styles.infoText}>
                  Você receberá um código de 6 dígitos no seu e-mail para redefinir sua senha.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  container: { 
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    color: '#f6e27f',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 500, 
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a292e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f6e27f',
  },
  card: {
    width: '100%',
    backgroundColor: '#1c1b1f',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: { 
    color: '#aaa', 
    fontSize: 14, 
    lineHeight: 20,
    marginBottom: 25,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f6e27f',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    color: '#fff', 
    padding: 15, 
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
  },
  button: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18, 
    borderRadius: 12, 
    width: '100%',
    marginTop: 10,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2a292e',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#64b5f6',
  },
  infoText: {
    flex: 1,
    color: '#aaa',
    fontSize: 13,
    lineHeight: 18,
  },
});