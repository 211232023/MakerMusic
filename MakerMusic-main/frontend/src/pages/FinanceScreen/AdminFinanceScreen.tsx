import React, { useState, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllStudentsFinance, createOrUpdatePayment } from '../../services/api';
import CustomPicker from '../../components/CustomPicker';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminFinanceScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { showError, showSuccess } = useToast();
  
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Mensalidade Escola MakerMusic');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (token) {
      const allStudents = await getAllStudentsFinance(token);
      if (Array.isArray(allStudents)) setStudents(allStudents);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchStudents(); }, [fetchStudents]));

  const handleSavePayment = async () => {
    if (!selectedStudentId || !amount) {
      showError('Por favor, selecione um aluno e insira o valor.');
      return;
    }
    if (!token) return;
    setIsLoading(true);
    
    const paymentData = {
      studentId: selectedStudentId,
      amount: parseFloat(amount),
      description: description,
      status: 'PENDENTE',
      fixedDueDay: 5
    };

    try {
      const response = await createOrUpdatePayment(paymentData, token);
      setIsLoading(false);
      
      if (response.message) {
        showSuccess(`Mensalidade lançada com sucesso!\nVencimento: ${response.dueDate}\nPrazo: ${response.daysUntilDue} dias`);
        setSelectedStudentId(null);
        setAmount('');
        setDescription('Mensalidade Escola MakerMusic');
      } else {
        showError('Erro ao registrar pagamento.');
      }
    } catch (error) {
      setIsLoading(false);
      showError('Erro ao conectar com o servidor.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#f6e27f" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="cash-outline" size={32} color="#f6e27f" />
              <Text style={styles.title}>Lançar Mensalidade</Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
          >
            <View style={styles.card}>
              <View style={styles.infoBox}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle-outline" size={24} color="#64b5f6" />
                  <Text style={styles.infoTitle}>Regras de Lançamento</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={18} color="#aaa" />
                  <Text style={styles.infoText}>Vencimento fixo: Dia 05 de cada mês</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={18} color="#aaa" />
                  <Text style={styles.infoText}>Antecedência mínima: 10 dias</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="business-outline" size={18} color="#aaa" />
                  <Text style={styles.infoText}>Finais de semana/feriados: Próximo dia útil</Text>
                </View>
                <Text style={styles.infoSmallText}>* O sistema calcula automaticamente a data de vencimento.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Selecionar Aluno</Text>
                <View style={styles.pickerWrapper}>
                  <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <CustomPicker
                    selectedValue={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                    items={[
                      { label: 'Selecione um aluno...', value: null }, 
                      ...students.map(s => ({ label: s.name, value: s.id }))
                    ]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor da Mensalidade (R$)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="cash-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    value={amount} 
                    onChangeText={setAmount} 
                    keyboardType="numeric" 
                    placeholder="Ex: 150.00" 
                    placeholderTextColor="#666" 
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    value={description} 
                    onChangeText={setDescription} 
                    placeholder="Ex: Mensalidade Fevereiro 2026" 
                    placeholderTextColor="#666" 
                  />
                </View>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f6e27f" />
                  <Text style={styles.loadingText}>Processando...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.confirmButton} 
                  onPress={handleSavePayment}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={22} color="#1c1b1f" />
                  <Text style={styles.confirmButtonText}>Confirmar Lançamento</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  keyboardView: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#f6e27f',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  infoBox: { 
    backgroundColor: '#1c1b1f', 
    padding: 18, 
    borderRadius: 12,
    marginBottom: 25, 
    borderWidth: 1, 
    borderColor: '#64b5f620',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  infoTitle: { 
    color: '#64b5f6', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: { 
    color: '#fff', 
    fontSize: 14,
    flex: 1,
  },
  infoSmallText: { 
    color: '#aaa', 
    fontSize: 12, 
    marginTop: 10,
    fontStyle: 'italic',
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
    backgroundColor: '#1c1b1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
    overflow: 'hidden',
    minHeight: 50,
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
  confirmButton: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18, 
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
});