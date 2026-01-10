import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllUsers, createOrUpdatePayment, getAllStudentsFinance } from '../../services/api';
import RNPickerSelect from 'react-native-picker-select';
import { useToast } from '../../contexts/ToastContext';

type User = { id: string; name: string; role: string; };

export default function AdminFinanceScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { showError, showSuccess } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (token) {
      // Usando a nova função que busca todos os alunos diretamente da rota /finance/students
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
      showSuccess('Pagamento registado com sucesso!');
      setTimeout(() => navigation.goBack(), 1000);
    } else {
      showError('Não foi possível registar o pagamento.');
    }
  };
  
  // MUDANÇA: Formatar alunos para o RNPickerSelect
  const studentItems = students.map(student => ({
    label: student.name,
    value: student.id,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lançar Mensalidade</Text>

      <Text style={styles.label}>Aluno</Text>
      {/* MUDANÇA: Substituído Picker por RNPickerSelect */}
      <RNPickerSelect
        onValueChange={(value) => setSelectedStudentId(value)}
        items={studentItems}
        style={pickerSelectStyles}
        placeholder={{ label: 'Selecione um aluno...', value: null }}
        value={selectedStudentId}
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

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#1c1b1f', 
      padding: 20, 
      alignItems: 'center' 
    },
    title: { 
      fontSize: 28, 
      fontWeight: 'bold', 
      color: '#f6e27f', 
      marginBottom: 30, 
      marginTop: 40 
    },
    label: { 
      fontSize: 16, 
      color: '#fff', 
      marginBottom: 10, 
      alignSelf: 'flex-start', 
      marginLeft: 5 
    },
    input: { 
      width: '100%', 
      backgroundColor: '#333', 
      color: '#fff', 
      padding: 15, 
      borderRadius: 10, 
      marginBottom: 20 
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
      position: 'absolute', 
      bottom: 50, 
      alignSelf: 'center' 
    },
    backButtonText: { 
      color: '#d4af37', 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
});

// MUDANÇA: Adicionados estilos para o RNPickerSelect
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: 'white',
    paddingRight: 30,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#333',
    borderRadius: 10,
    color: 'white',
    paddingRight: 30,
    backgroundColor: '#333',
    marginBottom: 20,
  },
});