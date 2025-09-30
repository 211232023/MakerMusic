import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllUsers, createOrUpdatePayment } from '../../services/api';
import { Picker } from '@react-native-picker/picker';

type User = { id: string; name: string; role: string; };

export default function AdminFinanceScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(''); // AAAA-MM-DD
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (token) {
      const allUsers = await getAllUsers(token);
      if (Array.isArray(allUsers)) {
        setStudents(allUsers.filter(u => u.role === 'ALUNO'));
      }
    }
  }, [token]);

  useFocusEffect(fetchStudents);

  const handleSavePayment = async () => {
    if (!selectedStudentId || !amount || !paymentDate) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    if (!token) return;

    setIsLoading(true);
    const paymentData = {
      studentId: selectedStudentId,
      amount: parseFloat(amount),
      paymentDate,
      status: 'PENDENTE', // Por defeito, um novo pagamento está pendente
      description: 'Mensalidade'
    };

    const response = await createOrUpdatePayment(paymentData, token);
    setIsLoading(false);

    if (response.message) {
      Alert.alert('Sucesso', 'Pagamento registado com sucesso!');
      navigation.goBack();
    } else {
      Alert.alert('Erro', 'Não foi possível registar o pagamento.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lançar Mensalidade</Text>

      <Text style={styles.label}>Aluno</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStudentId}
          onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um aluno..." value={null} />
          {students.map(student => (
            <Picker.Item key={student.id} label={student.name} value={student.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Valor (ex: 150.00)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="150.00"
      />

      <Text style={styles.label}>Data de Vencimento</Text>
      <TextInput
        style={styles.input}
        value={paymentDate}
        onChangeText={setPaymentDate}
        placeholder="AAAA-MM-DD"
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSavePayment}>
          <Text style={styles.buttonText}>Lançar Pagamento</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 30, marginTop: 40 },
    label: { fontSize: 16, color: '#fff', marginBottom: 10, alignSelf: 'flex-start' },
    input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
    pickerContainer: { width: '100%', backgroundColor: '#333', borderRadius: 10, marginBottom: 20 },
    picker: { color: '#fff', height: 60 },
    button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginVertical: 20 },
    buttonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
    backButtonText: { color: '#d4af37', marginTop: 15 },
});