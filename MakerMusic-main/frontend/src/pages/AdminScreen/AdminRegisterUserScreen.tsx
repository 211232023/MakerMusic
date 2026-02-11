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
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="person-add" size={32} color="#f6e27f" />
              <Text style={styles.title}>Cadastrar Novo Usuário</Text>
            </View>
            <Text style={styles.subtitle}>Preencha os dados para criar uma nova conta</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={22} color="#64b5f6" />
                <Text style={styles.cardTitle}>Dados Pessoais</Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Ionicons name="person-outline" size={18} color="#f6e27f" />
                  <Text style={styles.label}>Nome Completo</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="Digite o nome completo" 
                  placeholderTextColor="#666" 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Ionicons name="mail-outline" size={18} color="#f6e27f" />
                  <Text style={styles.label}>E-mail</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="Digite o e-mail" 
                  placeholderTextColor="#666" 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address" 
                  autoCapitalize="none" 
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#f6e27f" />
                  <Text style={styles.label}>Senha</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="Digite a senha" 
                  placeholderTextColor="#666" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry 
                />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#81c784" />
                <Text style={styles.cardTitle}>Tipo de Usuário</Text>
              </View>
              
              <View style={styles.roleButtonsContainer}>
                {[
                  { role: "ALUNO", icon: "school-outline", color: "#64b5f6" },
                  { role: "PROFESSOR", icon: "person-outline", color: "#81c784" },
                  { role: "ADMIN", icon: "shield-checkmark-outline", color: "#f6e27f" },
                  { role: "FINANCEIRO", icon: "cash-outline", color: "#ffb74d" }
                ].map((item) => (
                  <TouchableOpacity 
                    key={item.role} 
                    style={[
                      styles.roleButton, 
                      selectedRole === item.role && [
                        styles.roleButtonSelected,
                        { borderColor: item.color, backgroundColor: `${item.color}15` }
                      ]
                    ]} 
                    onPress={() => setSelectedRole(item.role as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.roleIconCircle,
                      selectedRole === item.role && { backgroundColor: `${item.color}25` }
                    ]}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={24} 
                        color={selectedRole === item.role ? item.color : "#666"} 
                      />
                    </View>
                    <Text style={[
                      styles.roleButtonText, 
                      selectedRole === item.role && [styles.roleButtonTextSelected, { color: item.color }]
                    ]}>
                      {item.role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedRole === 'ALUNO' && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="school" size={22} color="#64b5f6" />
                  <Text style={styles.cardTitle}>Informações do Aluno</Text>
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="bar-chart-outline" size={18} color="#f6e27f" />
                    <Text style={styles.label}>Nível</Text>
                  </View>
                  <CustomPicker 
                    selectedValue={studentLevel} 
                    onValueChange={setStudentLevel} 
                    items={[
                      { label: "Selecione o nível...", value: null }, 
                      { label: "Iniciante", value: "INICIANTE" }, 
                      { label: "Intermediário", value: "INTERMEDIARIO" }, 
                      { label: "Avançado", value: "AVANCADO" }
                    ]} 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="musical-notes-outline" size={18} color="#f6e27f" />
                    <Text style={styles.label}>Instrumento</Text>
                  </View>
                  <CustomPicker 
                    selectedValue={instrumentCategory} 
                    onValueChange={setInstrumentCategory} 
                    items={[
                      { label: "Selecione o instrumento...", value: null }, 
                      { label: "Corda", value: "CORDA" }, 
                      { label: "Sopro", value: "SOPRO" }, 
                      { label: "Percussão", value: "PERCUSSAO" }, 
                      { label: "Eletrônicos", value: "ELETRONICOS" }
                    ]} 
                  />
                </View>
              </View>
            )}

            {selectedRole === 'PROFESSOR' && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person" size={22} color="#81c784" />
                  <Text style={styles.cardTitle}>Informações do Professor</Text>
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="musical-notes-outline" size={18} color="#f6e27f" />
                    <Text style={styles.label}>Especialidade</Text>
                  </View>
                  <CustomPicker 
                    selectedValue={teacherCategory} 
                    onValueChange={setTeacherCategory} 
                    items={[
                      { label: "Selecione a especialidade...", value: null }, 
                      { label: "Corda", value: "CORDA" }, 
                      { label: "Sopro", value: "SOPRO" }, 
                      { label: "Percussão", value: "PERCUSSAO" }, 
                      { label: "Teclados/Eletrônicos", value: "ELETRONICO" }
                    ]} 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="bar-chart-outline" size={18} color="#f6e27f" />
                    <Text style={styles.label}>Nível de Ensino</Text>
                  </View>
                  <TextInput 
                    style={styles.input} 
                    placeholder="ex: Básico, Escolar, Avançado, Acadêmico" 
                    placeholderTextColor="#666" 
                    value={teacherLevel} 
                    onChangeText={setTeacherLevel} 
                  />
                </View>
              </View>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6e27f" />
                <Text style={styles.loadingText}>Criando conta...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color="#1c1b1f" />
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
    paddingBottom: 40,
  },
  container: { 
    flex: 1, 
    padding: 20, 
    width: '100%' 
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 30,
    gap: 8,
    paddingVertical: 8,
  },
  backText: {
    color: '#f6e27f',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 600, 
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#2a292e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3e',
  },
  cardTitle: {
    color: '#f6e27f',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    color: '#f6e27f',
    fontSize: 14,
    fontWeight: '600',
  },
  input: { 
    width: '100%', 
    backgroundColor: "#1c1b1f", 
    color: "#fff", 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  roleButtonsContainer: { 
    flexDirection: "row", 
    flexWrap: 'wrap', 
    gap: 12,
  },
  roleButton: { 
    backgroundColor: "#1c1b1f", 
    padding: 15, 
    borderRadius: 12, 
    flex: 1,
    minWidth: '47%', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
    gap: 10,
  },
  roleButtonSelected: { 
    borderWidth: 2,
  },
  roleIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonText: { 
    color: "#aaa", 
    fontWeight: "bold",
    fontSize: 13,
  },
  roleButtonTextSelected: { 
    fontWeight: "bold",
  },
  loadingContainer: {
    marginVertical: 30,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
  },
  button: { 
    backgroundColor: "#f6e27f", 
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: "center", 
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { 
    color: "#1c1b1f", 
    fontWeight: "bold", 
    fontSize: 18 
  }
});