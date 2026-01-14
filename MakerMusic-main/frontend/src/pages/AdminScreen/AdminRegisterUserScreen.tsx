import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/navigation";
import { registerUserByAdmin } from "../../services/api";
import { useUser } from "../src/UserContext";
import CustomPicker from "../../components/CustomPicker";
import { useToast } from "../../contexts/ToastContext";

export default function AdminRegisterUserScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { token } = useUser();
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !selectedRole) {
      showError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);
    const userData = {
      name, email, password, role: selectedRole,
      student_level: selectedRole === 'ALUNO' ? studentLevel : null,
      instrument_category: selectedRole === 'ALUNO' ? instrumentCategory : null,
      teacher_category: selectedRole === 'PROFESSOR' ? teacherCategory : null,
      teacher_level: selectedRole === 'PROFESSOR' ? teacherLevel : null 
    };

    try {
      const response = await registerUserByAdmin(userData, token);
      if (response.userId) {
        showSuccess(`Conta de ${selectedRole} criada com sucesso!`);
        setName(''); setEmail(''); setPassword(''); setSelectedRole(null);
      } else { showError(response.message || "Erro ao criar conta."); }
    } catch (error) { showError("Erro de conexão."); }
    finally { setIsLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastrar Novo Usuário</Text>
        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="Nome Completo" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry />

          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Selecione o tipo de usuário:</Text>
            <View style={styles.roleButtonsContainer}>
              {["ALUNO", "PROFESSOR", "ADMIN", "FINANCEIRO"].map((role) => (
                <TouchableOpacity key={role} style={[styles.roleButton, selectedRole === role && styles.roleButtonSelected]} onPress={() => setSelectedRole(role as any)}>
                  <Text style={[styles.roleButtonText, selectedRole === role && styles.roleButtonTextSelected]}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedRole === 'ALUNO' && (
            <View style={styles.extraFields}>
              <Text style={styles.roleTitle}>Informações do Aluno:</Text>
              <CustomPicker selectedValue={studentLevel} onValueChange={setStudentLevel} items={[{ label: "Nível...", value: null }, { label: "Iniciante", value: "INICIANTE" }, { label: "Intermediário", value: "INTERMEDIARIO" }, { label: "Avançado", value: "AVANCADO" }]} />
              <CustomPicker selectedValue={instrumentCategory} onValueChange={setInstrumentCategory} items={[{ label: "Instrumento...", value: null }, { label: "Corda", value: "CORDA" }, { label: "Sopro", value: "SOPRO" }, { label: "Percussão", value: "PERCUSSAO" }, { label: "Eletrônicos", value: "ELETRONICOS" }]} />
            </View>
          )}

          {selectedRole === 'PROFESSOR' && (
            <View style={styles.extraFields}>
              <Text style={styles.roleTitle}>Informações do Professor:</Text>
              <CustomPicker selectedValue={teacherCategory} onValueChange={setTeacherCategory} items={[{ label: "Especialidade...", value: null }, { label: "Corda", value: "CORDA" }, { label: "Sopro", value: "SOPRO" }, { label: "Percussão", value: "PERCUSSAO" }, { label: "Teclados/Eletrônicos", value: "ELETRONICO" }]} />
              <TextInput style={styles.input} placeholder="Nível (ex: Básico, Escolar, Avançado, Acadêmico)" placeholderTextColor="#aaa" value={teacherLevel} onChangeText={setTeacherLevel} />
            </View>
          )}

          {isLoading ? <ActivityIndicator size="large" color="#d4af37" /> : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}><Text style={styles.buttonText}>Criar Conta</Text></TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.loginLink}>Voltar</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    backgroundColor: "#1c1b1f" 
  },
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center', 
    width: '100%' 
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 600, 
    alignSelf: 'center' 
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 30, 
    marginTop: 40, 
    textAlign: 'center' 
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
  roleContainer: { 
    width: '100%', 
    marginBottom: 20 
  },
  roleTitle: { 
    color: "#f6e27f", 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  roleButtonsContainer: { 
    flexDirection: "row", 
    flexWrap: 'wrap', 
    justifyContent: "space-between" 
  },
  roleButton: { 
    backgroundColor: "#333", 
    padding: 10, 
    borderRadius: 10, 
    marginVertical: 5, 
    minWidth: '48%', 
    alignItems: 'center' 
  },
  roleButtonSelected: { 
    borderColor: "#d4af37", 
    borderWidth: 2 
  },
  roleButtonText: { 
    color: "#aaa", 
    fontWeight: "bold" 
  },
  roleButtonTextSelected: { 
    color: "#d4af37" 
  },
  extraFields: { 
    width: '100%', 
    marginBottom: 20 
  },
  button: { 
    backgroundColor: "#d4af37", 
    padding: 15, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: "center", 
    marginVertical: 20 
  },
  buttonText: { 
    color: "#1c1b1f", 
    fontWeight: "bold", 
    fontSize: 18 
  },
  loginLink: { 
    color: "#d4af37", 
    fontWeight: "bold", 
    textAlign: 'center', 
    marginTop: 10 
  }
});