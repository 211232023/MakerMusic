import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMyStudents, createTask } from '../../services/api';
import CustomPicker from '../../components/CustomPicker';
import { useToast } from '../../contexts/ToastContext';

export default function TasksScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { showError, showSuccess, showWarning } = useToast();

  const [title, setTitle] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const loadStudents = useCallback(async () => {
    if (token) {
      try {
        setIsLoadingStudents(true);
        const studentList = await getMyStudents(token);
        setStudents(Array.isArray(studentList) ? studentList : []);
      } finally { setIsLoadingStudents(false); }
    }
  }, [token]);

  useFocusEffect(useCallback(() => { loadStudents(); }, [loadStudents]));

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedStudentId) {
      showWarning('Por favor, escreva o título da tarefa e selecione um aluno.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await createTask({ title, studentId: selectedStudentId }, token!);
      if (response.message === 'Tarefa criada com sucesso!') {
        showSuccess('Tarefa atribuída com sucesso!');
        setTitle(''); setSelectedStudentId(null);
      }
    } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atribuir Tarefa</Text>
      <View style={styles.formContainer}>
        <TextInput style={styles.input} placeholder="Título da Tarefa" placeholderTextColor="#aaa" value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Atribuir para o Aluno:</Text>
        {isLoadingStudents ? <ActivityIndicator size="large" color="#d4af37" /> : (
          <CustomPicker selectedValue={selectedStudentId} onValueChange={setSelectedStudentId} items={[{ label: 'Selecione um aluno...', value: null }, ...students.map(s => ({ label: s.name, value: s.id }))]} />
        )}
        {isLoading ? <ActivityIndicator size="large" color="#d4af37" /> : (
          <TouchableOpacity style={styles.button} onPress={handleCreateTask}><Text style={styles.buttonText}>Criar e Atribuir Tarefa</Text></TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backButtonText}>Voltar</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20, width: '100%' },
  formContainer: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 30, marginTop: 40, textAlign: 'center' },
  label: { fontSize: 18, color: '#fff', marginBottom: 10 },
  input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginVertical: 20 },
  buttonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
  backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' }
});
