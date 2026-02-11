import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/navigation";
import { registerUserByAdmin } from "../../services/api";
import { useUser } from "../src/UserContext";
import CustomPicker from "../../components/CustomPicker";
import { useToast } from "../../contexts/ToastContext";
import { Ionicons } from '@expo/vector-icons';

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

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainRouter' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1b1f" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Cadastrar Novo Usuário</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nome Completo" 
                placeholderTextColor="#666" 
                value={name} 
                onChangeText={setName} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Email" 
                placeholderTextColor="#666" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Senha" 
                placeholderTextColor="#666" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>

            <View style={styles.roleContainer}>
              <Text style={styles.roleTitle}>Selecione o tipo de usuário:</Text>
              <View style={styles.roleButtonsContainer}>
                {["ALUNO", "PROFESSOR", "ADMIN", "FINANCEIRO"].map((role) => (
                  <TouchableOpacity 
                    key={role} 
                    style={[styles.roleButton, selectedRole === role && styles.roleButtonSelected]} 
                    onPress={() => setSelectedRole(role as any)}
                  >
                    <Text style={[styles.roleButtonText, selectedRole === role && styles.roleButtonTextSelected]}>{role}</Text>
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
                  items={[
                    { label: "Nível...", value: null }, 
                    { label: "Iniciante", value: "INICIANTE" }, 
                    { label: "Intermediário", value: "INTERMEDIARIO" }, 
                    { label: "Avançado", value: "AVANCADO" }
                  ]} 
                />
                <View style={{ height: 15 }} />
                <CustomPicker 
                  selectedValue={instrumentCategory} 
                  onValueChange={setInstrumentCategory} 
                  items={[
                    { label: "Instrumento...", value: null }, 
                    { label: "Corda", value: "CORDA" }, 
                    { label: "Sopro", value: "SOPRO" }, 
                    { label: "Percussão", value: "PERCUSSAO" }, 
                    { label: "Eletrônicos", value: "ELETRONICOS" }
                  ]} 
                />
              </View>
            )}

            {selectedRole === 'PROFESSOR' && (
              <View style={styles.extraFields}>
                <Text style={styles.roleTitle}>Informações do Professor:</Text>
                <CustomPicker 
                  selectedValue={teacherCategory} 
                  onValueChange={setTeacherCategory} 
                  items={[
                    { label: "Especialidade...", value: null }, 
                    { label: "Corda", value: "CORDA" }, 
                    { label: "Sopro", value: "SOPRO" }, 
                    { label: "Percussão", value: "PERCUSSAO" }, 
                    { label: "Teclados/Eletrônicos", value: "ELETRONICO" }
                  ]} 
                />
                <View style={{ height: 15 }} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Nível (ex: Básico, Escolar, Avançado, Acadêmico)" 
                  placeholderTextColor="#666" 
                  value={teacherLevel} 
                  onChangeText={setTeacherLevel} 
                />
              </View>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6e27f" />
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Criar Conta</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1c1b1f",
  },
  scrollContainer: { 
    flexGrow: 1, 
  },
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center', 
    width: '100%' 
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
    maxWidth: 600, 
    alignSelf: 'center' 
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    color: '#f6e27f',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: { 
    width: '100%', 
    backgroundColor: "#2a292e", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  roleContainer: { 
    width: '100%', 
    marginVertical: 20 
  },
  roleTitle: { 
    color: "#f6e27f", 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 15 
  },
  roleButtonsContainer: { 
    flexDirection: "row", 
    flexWrap: 'wrap', 
    justifyContent: "space-between",
    gap: 10,
  },
  roleButton: { 
    backgroundColor: "#2a292e", 
    padding: 12, 
    borderRadius: 10, 
    flex: 1,
    minWidth: '45%', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  roleButtonSelected: { 
    borderColor: "#f6e27f", 
    backgroundColor: 'rgba(246, 226, 127, 0.1)',
  },
  roleButtonText: { 
    color: "#aaa", 
    fontWeight: "bold" 
  },
  roleButtonTextSelected: { 
    color: "#f6e27f" 
  },
  extraFields: { 
    width: '100%', 
    marginBottom: 20,
    backgroundColor: '#2a292e',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  button: { 
    backgroundColor: "#f6e27f", 
    padding: 18, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: "center", 
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: { 
    color: "#1c1b1f", 
    fontWeight: "bold", 
    fontSize: 18 
  }
});