import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useUser } from "../src/UserContext";
import { RootStackParamList } from "../src/types/navigation.js";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function LoginScreen() {
  const { login } = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);

      if (user) {
        // Navega de acordo com o tipo de usuário
        switch (user.role) {
          case "Aluno":
            navigation.replace("StudentsScreen");
            break;
          case "Professor":
            navigation.replace("TeacherScreen");
            break;
          case "Admin":
            navigation.replace("AdminHomeScreen");
            break;
          default:
            navigation.replace("LoginScreen");
            break;
        }
      } else {
        Alert.alert("Erro", "Email ou senha incorretos!");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          Não tem uma conta? <Text style={styles.registerLink}>Cadastre-se</Text>
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
  registerText: { color: "#fff", marginTop: 20, fontSize: 14 },
  registerLink: { color: "#d4af37", fontWeight: "bold" },
});
