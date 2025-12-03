import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/navigation";
import { registerUserByAdmin } from "../../services/api";
import { useUser } from "../src/UserContext"; // Para pegar o token do Admin

export default function AdminRegisterUserScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token } = useUser(); // Pega o token do Admin logado
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Garante que apenas Admins possam usar esta tela
  if (user?.role !== 'ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso Negado</Text>
        <Text style={styles.errorText}>Apenas administradores podem acessar esta função.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (!selectedRole) {
      Alert.alert("Erro", "Por favor, selecione o tipo de usuário.");
      return;
    }

    setIsLoading(true);

    const userData = {
      name,
      email,
      password,
      role: selectedRole,
    };

    try {
      // Usa a nova função de registro por Admin que envia o token
      const response = await registerUserByAdmin(userData, token);

      if (response.userId) {
        Alert.alert("Sucesso", `Conta de ${selectedRole} criada com sucesso!`);
        console.log(`SUCESSO: Conta de ${selectedRole} criada.`);
        // Limpa os campos após o sucesso
        setName('');
        setEmail('');
        setPassword('');
        setSelectedRole(null);
      } else {
        Alert.alert("Erro de Cadastro", response.message || "Ocorreu um erro ao criar a conta.");
      }
    } catch (error) {
      console.error("Falha no registo:", error);
      Alert.alert("Erro", "Não foi possível ligar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = ["ALUNO", "PROFESSOR", "ADMIN", "FINANCEIRO"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Usuário</Text>

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

      {/* Seção de seleção de tipo de usuário */}
      <View style={styles.roleContainer}>
        <Text style={styles.roleTitle}>Selecione o tipo de usuário:</Text>
        
        <View style={styles.roleButtonsContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                selectedRole === role && styles.roleButtonSelected
              ]}
              onPress={() => setSelectedRole(role as "ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO")}
            >
              <Text style={[
                styles.roleButtonText,
                selectedRole === role && styles.roleButtonTextSelected
              ]}>
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Criar Conta</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.loginText}>
          <Text style={styles.loginLink}>Voltar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#1c1b1f", 
    padding: 20 
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 30 
  },
  errorText: {
    color: '#ff6347',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: { 
    width: "100%", 
    backgroundColor: "#333", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    fontSize: 16 
  },
  
  // Estilos para a seção de seleção de tipo de usuário
  roleContainer: {
    width: "100%",
    marginBottom: 20,
  },
  roleTitle: {
    color: "#f6e27f",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  roleButtonsContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: "space-between",
    width: "100%",
  },
  roleButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 2,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
    minWidth: '23%', // Para caber 4 em uma linha com margem
  },
  roleButtonSelected: {
    backgroundColor: "#2a2a2a",
    borderColor: "#d4af37",
  },
  roleButtonText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "bold",
  },
  roleButtonTextSelected: {
    color: "#d4af37",
  },
  
  button: { 
    backgroundColor: "#d4af37", 
    padding: 15, 
    borderRadius: 10, 
    width: "100%", 
    alignItems: "center", 
    marginTop: 20 
  },
  buttonText: { 
    color: "#1c1b1f", 
    fontWeight: "bold", 
    fontSize: 18 
  },
  loginText: { 
    color: "#fff", 
    marginTop: 20, 
    fontSize: 14 
  },
  loginLink: { 
    color: "#d4af37", 
    fontWeight: "bold" 
  },
});