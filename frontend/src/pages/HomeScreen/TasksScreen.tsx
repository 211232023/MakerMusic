import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext'; 
import { getStudentsByTeacher, createTask } from '../../services/api';

type Student = {
  id: string; 
  name: string;
};

export default function TasksScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser(); 

  const [title, setTitle] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const loadStudents = useCallback(async () => {
    if (user && token && user.role === 'PROFESSOR') {
      try {
        setIsLoadingStudents(true);
        const studentList = await getStudentsByTeacher(user.id, token);
        if (Array.isArray(studentList)) {
            setStudents(studentList);
        } else {
            setStudents([]);
        }
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        Alert.alert("Erro", "Não foi possível carregar a lista de alunos.");
      } finally {
        setIsLoadingStudents(false);
      }
    }
  }, [user, token]);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedStudentId) {
      Alert.alert('Erro', 'Por favor, preencha o título da tarefa e selecione um aluno.');
      return;
    }

    setIsLoading(true);
    
    const taskData = {
      title,
      studentId: selectedStudentId,
    };

    try {
      const response = await createTask(taskData, token);

      if (response.message === 'Tarefa criada com sucesso!') {
        Alert.alert('Sucesso', 'Tarefa criada e atribuída com sucesso!');
        setTitle('');
        setSelectedStudentId(null);
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível criar a tarefa.');
      }
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        Alert.alert("Erro", "Ocorreu um erro de comunicação com o servidor.");
    } finally {
        setIsLoading(false);
    }
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
      
      {isLoadingStudents ? (
        <ActivityIndicator size="large" color="#d4af37" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.studentItem,
                selectedStudentId === item.id && styles.selectedStudentItem,
              ]}
              onPress={() => setSelectedStudentId(item.id)}
            >
              <Text style={selectedStudentId === item.id ? styles.selectedStudentName : styles.studentName}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno vinculado a você.</Text>}
          style={{ maxHeight: 250 }} // Limita a altura da lista
        />
      )}

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
    title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 30, marginTop: 40, textAlign: 'center' },
    input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
    label: { fontSize: 18, color: '#fff', marginBottom: 10 },
    studentItem: { padding: 15, backgroundColor: '#333', borderRadius: 10, marginBottom: 10 },
    selectedStudentItem: { backgroundColor: '#d4af37' },
    studentName: { color: '#fff', fontSize: 16 },
    selectedStudentName: { color: '#1c1b1f', fontSize: 16, fontWeight: 'bold' }, // Estilo para o texto do aluno selecionado
    emptyText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
    button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginVertical: 20 },
    buttonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
    backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
    backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
});