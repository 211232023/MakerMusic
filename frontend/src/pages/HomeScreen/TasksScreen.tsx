import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getMyStudents, createTask } from '../../services/api';

// Tipos
type Student = {
  id: number;
  name: string;
};

export default function TasksScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar a lista de alunos quando a tela abre
  useEffect(() => {
    const loadStudents = async () => {
      const studentList = await getMyStudents();
      setStudents(studentList);
    };
    loadStudents();
  }, []);

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedStudent) {
      Alert.alert('Erro', 'Por favor, preencha o título da tarefa e selecione um aluno.');
      return;
    }

    setIsLoading(true);
    // Para este exemplo, vamos assumir que o professor tem apenas uma turma (classId: 1)
    // Numa aplicação real, você teria uma forma de o professor selecionar a turma também.
    const taskData = {
      title,
      studentId: selectedStudent.id,
      classId: 1, // IMPORTANTE: Assumindo um ID de turma fixo para simplificar
    };

    const response = await createTask(taskData);

    if (response.taskId) {
      Alert.alert('Sucesso', 'Tarefa criada e atribuída com sucesso!');
      setTitle('');
      setSelectedStudent(null);
    } else {
      Alert.alert('Erro', response.message || 'Não foi possível criar a tarefa.');
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Tarefas</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Título da Tarefa (ex: Praticar Escala Maior)"
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Atribuir para o Aluno:</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.studentItem,
              selectedStudent?.id === item.id && styles.selectedStudentItem,
            ]}
            onPress={() => setSelectedStudent(item)}
          >
            <Text style={styles.studentName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno encontrado.</Text>}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
          <Text style={styles.buttonText}>Criar Tarefa</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 20, marginTop: 40, textAlign: 'center' },
    input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
    label: { fontSize: 18, color: '#fff', marginBottom: 10 },
    studentItem: { padding: 15, backgroundColor: '#333', borderRadius: 10, marginBottom: 10 },
    selectedStudentItem: { backgroundColor: '#d4af37' },
    studentName: { color: '#fff', fontSize: 16 },
    emptyText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center' },
    button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginVertical: 20 },
    buttonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
    backButton: { position: 'absolute', bottom: 30, alignSelf: 'center' },
    backButtonText: { color: '#d4af37', fontSize: 16 },
});