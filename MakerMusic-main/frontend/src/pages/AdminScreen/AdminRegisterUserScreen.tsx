import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, ViewStyle, TextStyle } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/navigation";
import { registerUserByAdmin } from "../../services/api";
import { useUser } from "../src/UserContext";
import CustomPicker from "../../components/CustomPicker";
import { useToast } from "../../contexts/ToastContext";

interface Styles {
  scrollContainer: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  errorText: TextStyle;
  input: TextStyle;
  roleContainer: ViewStyle;
  roleTitle: TextStyle;
  roleButtonsContainer: ViewStyle;
  roleButton: ViewStyle;
  roleButtonSelected: ViewStyle;
  roleButtonText: TextStyle;
  roleButtonTextSelected: TextStyle;
  extraFields: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  loginText: TextStyle;
  loginLink: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#1c1b1f",
  },
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
    marginBottom: 30,
    textAlign: 'center'
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
    minWidth: '23%',
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
  extraFields: {
    width: '100%',
    marginTop: 10,
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

export default function AdminRegisterUserScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token } = useUser();
  const { showError, showSuccess } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO" | null>(null);
  
  const [studentLevel, setStudentLevel] = useState<string | null>(null);
  const [instrumentCategory, setInstrumentCategory] = useState<string | null>(null);
  const [teacherCategory, setTeacherCategory] = useState<string | null>(null);
  const [teacherLevel, setTeacherLevel] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

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
      showError("Por favor, preencha todos os campos.");
      return;
    }

    if (!selectedRole) {
      showError("Por favor, selecione o tipo de usuário.");
      return;
    }

    setIsLoading(true);

    const userData = {
      name,
      email,
      password,
      role: selectedRole,
      student_level: selectedRole === 'ALUNO' ? studentLevel : null,
      instrument_category: selectedRole === 'ALUNO' ? instrumentCategory : null,
      teacher_category: selectedRole === 'PROFESSOR' ? teacherCategory : null,
      teacher_level: selectedRole === 'PROFESSOR' ? teacherLevel : null,
    };

    try {
      const response = await registerUserByAdmin(userData, token);

      if (response.userId) {
        showSuccess(`Conta de ${selectedRole} criada com sucesso!`);
        setName('');
        setEmail('');
        setPassword('');
        setSelectedRole(null);
        setStudentLevel(null);
        setInstrumentCategory(null);
        setTeacherCategory(null);
        setTeacherLevel("");
      } else {
        showError(response.message || "Ocorreu um erro ao criar a conta.");
      }
    } catch (error) {
      console.error("Falha no registo:", error);
      showError("Não foi possível ligar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = ["ALUNO", "PROFESSOR", "ADMIN", "FINANCEIRO"];
  
  const studentLevels = [
    { label: "Selecione o Nível", value: null },
    { label: "Iniciante", value: "INICIANTE" },
    { label: "Intermediário", value: "INTERMEDIARIO" },
    { label: "Avançado", value: "AVANCADO" },
  ];

  const instrumentCategories = [
    { label: "Selecione a Categoria", value: null },
    { label: "Corda", value: "CORDA" },
    { label: "Sopro", value: "SOPRO" },
    { label: "Percussão", value: "PERCUSSAO" },
    { label: "Eletrônicos", value: "ELETRONICOS" },
  ];

  const teacherCategories = [
    { label: "Selecione a Especialidade", value: null },
    { label: "Corda", value: "CORDA" },
    { label: "Sopro", value: "SOPRO" },
    { label: "Percussão", value: "PERCUSSAO" },
    { label: "Eletrônico", value: "ELETRONICO" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {selectedRole === 'ALUNO' && (
          <View style={styles.extraFields}>
            <Text style={styles.roleTitle}>Informações do Aluno:</Text>
            <CustomPicker
              selectedValue={studentLevel}
              onValueChange={setStudentLevel}
              items={studentLevels}
            />
            <CustomPicker
              selectedValue={instrumentCategory}
              onValueChange={setInstrumentCategory}
              items={instrumentCategories}
            />
          </View>
        )}

        {selectedRole === 'PROFESSOR' && (
          <View style={styles.extraFields}>
            <Text style={styles.roleTitle}>Informações do Professor:</Text>
            <CustomPicker
              selectedValue={teacherCategory}
              onValueChange={setTeacherCategory}
              items={teacherCategories}
            />
            <TextInput
              style={styles.input}
              placeholder="Nível (ex: Básico, Escolar, Avançado/Especializado, Acadêmico)"
              placeholderTextColor="#aaa"
              value={teacherLevel}
              onChangeText={setTeacherLevel}
            />
          </View>
        )}

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
    </ScrollView>
  );
}