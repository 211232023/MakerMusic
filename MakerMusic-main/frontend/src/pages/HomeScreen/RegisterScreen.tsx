import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/navigation";
import { registerUser } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { Ionicons } from '@expo/vector-icons';
import Logo from "../../components/Logo";

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showError, showSuccess } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      
      if (response.message === 'Usuário registrado com sucesso!') { 
        showSuccess("Conta de Aluno criada com sucesso! Você já pode fazer login.");
        
        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          navigation.navigate('Login');
        }, 3000);
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
              <Logo size="xlarge" />
              <Text style={styles.title}>MakerMusic</Text>
              <Text style={styles.subtitle}>Escola de Música</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-add" size={28} color="#64b5f6" />
                <Text style={styles.cardTitle}>Cadastre-se como Aluno</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome completo"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
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

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f6e27f" />
                  <Text style={styles.loadingText}>Criando sua conta...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleRegister}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#1c1b1f" />
                  <Text style={styles.buttonText}>Criar Conta de Aluno</Text>
                </TouchableOpacity>
              )}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#64b5f6" />
                <Text style={styles.infoText}>
                  Ao criar uma conta, você terá acesso a aulas, materiais e muito mais!
                </Text>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.loginButton}
            >
              <Ionicons name="log-in-outline" size={20} color="#f6e27f" />
              <Text style={styles.loginButtonText}>Já tem uma conta? Faça login</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Ionicons name="musical-notes" size={16} color="#666" />
              <Text style={styles.footerText}>Bem-vindo à MakerMusic</Text>
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a292e',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f6e27f',
    gap: 8,
  },
  loginButtonText: {
    color: '#f6e27f',
    fontWeight: '600',
    fontSize: 14,
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