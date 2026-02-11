import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { resetPassword } from "../../services/api";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useToast } from "../../contexts/ToastContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../src/types/navigation";
import { Ionicons } from '@expo/vector-icons';
import Logo from "../../components/Logo";

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { showError, showSuccess } = useToast();
  
  const { email } = route.params; 

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        setIsSuccess(true);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Logo size="large" />
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={isSuccess ? "checkmark-circle" : "key-outline"} 
                  size={60} 
                  color={isSuccess ? "#81c784" : "#f6e27f"} 
                />
              </View>
            </View>

            <View style={styles.card}>
              {!isSuccess ? (
                <>
                  <View style={styles.cardHeader}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#64b5f6" />
                    <Text style={styles.cardTitle}>Redefinir Senha</Text>
                  </View>

                  <Text style={styles.subtitle}>
                    Insira o código enviado para{' '}
                    <Text style={styles.emailHighlight}>{email}</Text>
                    {' '}e sua nova senha.
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Código de Recuperação</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="keypad-outline" size={20} color="#aaa" style={styles.inputIcon} />
                      <TextInput
                        placeholder="000000"
                        placeholderTextColor="#666"
                        value={token}
                        onChangeText={setToken}
                        style={styles.input}
                        keyboardType="numeric"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nova Senha</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor="#666"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={[styles.input, styles.inputWithIcon]}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)} 
                        style={styles.eyeIcon}
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color="#aaa" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirmar Nova Senha</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor="#666"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={[styles.input, styles.inputWithIcon]}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                        style={styles.eyeIcon}
                      >
                        <Ionicons 
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color="#aaa" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#f6e27f" />
                      <Text style={styles.loadingText}>Redefinindo senha...</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.button} 
                      onPress={handleResetPassword}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#1c1b1f" />
                      <Text style={styles.buttonText}>Redefinir Senha</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#81c784" />
                    <Text style={styles.successTitle}>Senha Redefinida!</Text>
                    <Text style={styles.successText}>
                      Sua senha foi alterada com sucesso. Você já pode utilizar sua nova senha para acessar a aplicação.
                    </Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => navigation.replace('Login')} 
                    style={styles.button}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="log-in-outline" size={20} color="#1c1b1f" />
                    <Text style={styles.buttonText}>Voltar para o Login</Text>
                  </TouchableOpacity>
                </>
              )}
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
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
  },
  formContainer: {
    width: "100%",
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
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: '#f6e27f',
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
  inputWithIcon: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
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
    backgroundColor: "#f6e27f",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
    gap: 8,
    shadowColor: "#f6e27f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#1c1b1f",
    fontWeight: "bold",
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successTitle: {
    color: '#81c784',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  successText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});