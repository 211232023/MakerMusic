import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (token) {
      const allStudents = await getAllStudentsFinance(token);
      if (Array.isArray(allStudents)) {
        setStudents(allStudents);
      }
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [fetchStudents])
  );

  const resetFields = () => {
    setSelectedStudentId(null);
    setAmount('');
    setPaymentDate('');
  };

  const handleSavePayment = async () => {
    if (!selectedStudentId || !amount || !paymentDate) {
      showError('Todos os campos são obrigatórios.');
      return;
    }
    if (!token) return;

    setIsLoading(true);
    const paymentData = {
      studentId: selectedStudentId,
      amount: parseFloat(amount),
      paymentDate,
      status: 'PENDENTE',
      description: 'Mensalidade'
    };

    const response = await createOrUpdatePayment(paymentData, token);
    setIsLoading(false);

    if (response.message) {
      showSuccess('Pagamento registrado com sucesso!');
      resetFields();
    } else {
      showError('Não foi possível registrar o pagamento.');
    }
  };
  
  const studentItems = [
    { label: 'Selecione um aluno...', value: null },
    ...students.map(student => ({
      label: student.name,
      value: student.id 
    }))
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Lançar Mensalidade</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Aluno</Text>
            <CustomPicker
              selectedValue={selectedStudentId}
              onValueChange={setSelectedStudentId}
              items={studentItems}
            />

            <Text style={styles.label}>Valor (ex: 150.00)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="150.00"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Data de Vencimento</Text>
            <TextInput
              style={styles.input}
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#aaa"
            />

            {isLoading ? (
              <ActivityIndicator size="large" color="#d4af37" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSavePayment}>
                <Text style={styles.buttonText}>Lançar Mensalidade</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f', 
    padding: 20, 
    alignItems: 'center', 
    width: '100%' 
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 30, 
    marginTop: 40,
    textAlign: 'center'
  },
  label: { 
    fontSize: 16, 
    color: '#f6e27f', 
    marginBottom: 10, 
    alignSelf: 'flex-start',
    fontWeight: 'bold'
  },
  input: { 
    width: '100%', 
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
    width: '100%', 
    alignItems: 'center', 
    marginVertical: 20 
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  backButton: { 
    marginTop: 30,
    marginBottom: 40,
    alignSelf: 'center' 
  },
  backButtonText: { 
    color: '#d4af37', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});