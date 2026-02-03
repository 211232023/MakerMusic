import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllStudentsFinance, createOrUpdatePayment } from '../../services/api';
import CustomPicker from '../../components/CustomPicker';
import { useToast } from '../../contexts/ToastContext';

export default function AdminFinanceScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { showError, showSuccess } = useToast();
  
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState('PENDENTE');
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de cálculo automático de vencimento
  useEffect(() => {
    const calculateDueDate = () => {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      let dueDate = new Date(currentYear, currentMonth, 5);

      // Se hoje for entre 25 e 31, a fatura fecha para o dia 05 do PRÓXIMO mês
      if (currentDay >= 25) {
        dueDate = new Date(currentYear, currentMonth + 1, 5);
      }

      // Formatar para YYYY-MM-DD
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setPaymentDate(formattedDate);

      // Ajuste solicitado: A mensalidade deve nascer sempre como PENDENTE no lançamento,
      // mesmo que o dia 05 já tenha passado, para dar prazo ao aluno.
      setStatus('PENDENTE');
    };

    calculateDueDate();
  }, []);

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
      paymentDate,
      status,
      paymentMethod: 'BOLETO', // Valor padrão inicial
      description: 'Mensalidade Escola MakerMusic'
    };

    try {
      const response = await createOrUpdatePayment(paymentData, token);
      setIsLoading(false);
      
      if (response.message) {
        showSuccess('Mensalidade lançada com sucesso como PENDENTE!');
        setSelectedStudentId(null);
        setAmount('');
      } else {
        showError('Erro ao registrar pagamento.');
      }
    } catch (error) {
      setIsLoading(false);
      showError('Erro ao conectar com o servidor.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Lançar Mensalidade</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Informações do Lançamento</Text>
              <Text style={styles.infoText}>Vencimento Sugerido: <Text style={styles.highlight}>{new Date(paymentDate + 'T00:00:00').toLocaleDateString('pt-BR')}</Text></Text>
              <Text style={styles.infoText}>Status Inicial: <Text style={[styles.highlight, {color: '#4CAF50'}]}>{status}</Text></Text>
              <Text style={styles.infoSmallText}>* A mensalidade nasce como PENDENTE para dar prazo de pagamento ao aluno.</Text>
            </View>

            <Text style={styles.label}>Selecionar Aluno</Text>
            <CustomPicker
              selectedValue={selectedStudentId}
              onValueChange={setSelectedStudentId}
              items={[{ label: 'Selecione um aluno...', value: null }, ...students.map(s => ({ label: s.name, value: s.id }))]}
            />

            <Text style={styles.label}>Valor da Mensalidade (R$)</Text>
            <TextInput 
              style={styles.input} 
              value={amount} 
              onChangeText={setAmount} 
              keyboardType="numeric" 
              placeholder="Ex: 150.00" 
              placeholderTextColor="#aaa" 
            />

            {isLoading ? <ActivityIndicator size="large" color="#d4af37" /> : (
              <TouchableOpacity style={styles.button} onPress={handleSavePayment}>
                <Text style={styles.buttonText}>Confirmar Lançamento</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    backgroundColor: '#1c1b1f' 
  },
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center' 
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 600 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 30, 
    marginTop: 40 
  },
  label: { 
    fontSize: 14, 
    color: '#f6e27f', 
    marginBottom: 8, 
    fontWeight: 'bold' 
  },
  input: { 
    backgroundColor: '#2a292e', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#333' 
  },
  button: { 
    backgroundColor: '#d4af37', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginVertical: 10, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 5 
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  backButton: { 
    marginTop: 20 
  },
  backButtonText: { 
    color: '#d4af37', 
    fontSize: 16, 
    fontWeight: 'bold'
  },
  infoBox: { 
    backgroundColor: '#2a292e', 
    padding: 15, 
    borderRadius: 10, marginBottom: 25, 
    borderWidth: 1, 
    borderColor: '#d4af37' 
  },
  infoTitle: { 
    color: '#d4af37', 
    fontWeight: 'bold', 
    marginBottom: 10, fontSize: 16 
  },
  infoText: { 
    color: '#fff', 
    fontSize: 15, 
    marginBottom: 5 
  },
  infoSmallText: { 
    color: '#aaa', 
    fontSize: 12, 
    marginTop: 5, 
    fontStyle: 'italic' 
  },
  highlight: { 
    fontWeight: 'bold', 
    color: '#f6e27f' 
  }
});