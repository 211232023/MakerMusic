import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUser } from "../src/UserContext";
import { useToast } from "../../contexts/ToastContext";
import { RootStackParamList } from "../src/types/navigation"; 
import { loginUser } from "../../services/api";
import { Ionicons } from '@expo/vector-icons';
import Logo from "../../components/Logo";


const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

export default function LoginScreen() {
  const { login } = useUser();
  const { showError, showSuccess } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Logo size="xlarge" />
            <Text style={styles.title}>MakerMusic</Text>
            <Text style={styles.subtitle}>Escola de Música</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="log-in" size={28} color="#f6e27f" />
              <Text style={styles.cardTitle}>Entrar na sua conta</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#aaa" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#aaa" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6e27f" />
                <Text style={styles.loadingText}>Entrando...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Ionicons name="log-in" size={20} color="#1c1b1f" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={() => navigation.navigate("ForgotPassword")} 
              style={styles.forgotButton}
            >
              <Ionicons name="help-circle-outline" size={16} color="#64b5f6" />
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate("Register")} 
            style={styles.registerButton}
          >
            <Ionicons name="person-add" size={20} color="#f6e27f" style={{ marginRight: 8 }} />
            <Text style={styles.registerButtonText}>Cadastre-se como Aluno</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Ionicons name="musical-notes" size={16} color="#666" />
            <Text style={styles.footerText}>Bem-vindo à MakerMusic</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingVertical: isLargeScreen ? 40 : 60,
  },
  formContainer: {
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: "#f6e27f",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    width: '100%',
    backgroundColor: "#1c1b1f",
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: "#2a292e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
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
    shadowColor: "#f6e27f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#1c1b1f",
    fontWeight: "bold",
    fontSize: 18,
  },
  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 5,
  },
  forgotText: {
    color: "#64b5f6",
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    fontSize: 14,
    marginHorizontal: 15,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a292e',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f6e27f',
  },
  registerButtonText: {
    color: "#f6e27f",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 8,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});