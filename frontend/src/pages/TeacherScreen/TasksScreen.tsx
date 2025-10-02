import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getStudentsByTeacher, createTask } from '../../services/api';
import { Picker } from '@react-native-picker/picker';

// Define o tipo para um aluno que vem da API
type Student = {
  id: string;
  name: string;
};

export default function TasksScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser(); // Obter dados do utilizador logado

  const [title, setTitle] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // Função para carregar os alunos vinculados a este professor
  const loadStudents = useCallback(async () => {
    if (user && token && user.role === 'PROFESSOR') {
      try {
        setIsLoadingStudents(true);
        const studentList = await getStudentsByTeacher(user.id, token);
        
        if (Array.isArray(studentList)) {
            setStudents(studentList);
        } else {
            // Se a resposta não for uma lista, define como vazio para evitar erros
            setStudents([]);
        }
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        Alert.alert("Erro", "Não foi possível carregar a sua lista de alunos.");
      } finally {
        setIsLoadingStudents(false);
      }
    }
  }, [user, token]);

  // `useFocusEffect` garante que a lista de alunos é recarregada sempre que o professor volta a esta tela
  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedStudentId) {
      Alert.alert('Atenção', 'Por favor, escreva o título da tarefa e selecione um aluno.');
      return;
    }

    setIsLoading(true);
    
    const taskData = {
      title,
      studentId: selectedStudentId,
    };

    try {
      if (!token) {
          Alert.alert("Erro", "Sessão inválida. Por favor, faça login novamente.");
          return;
      }
      
      const response = await createTask(taskData, token);

      if (response.message === 'Tarefa criada com sucesso!') {
        Alert.alert('Sucesso', 'Tarefa atribuída com sucesso!');
        // Limpa os campos após o sucesso
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
      <Text style={styles.title}>Atribuir Tarefa</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Título da Tarefa (ex: Praticar Escala de Dó Maior)"
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Atribuir para o Aluno:</Text>
      
      {isLoadingStudents ? (
        <ActivityIndicator size="large" color="#d4af37" />
      ) : (
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedStudentId}
                onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
                style={styles.picker}
                dropdownIconColor={'#FFFFFF'}
            >
                <Picker.Item label="Selecione um aluno..." value={null} color="#aaa" />
                {students.map(student => (
                    <Picker.Item key={student.id} label={student.name} value={student.id} />
                ))}
            </Picker>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
          <Text style={styles.buttonText}>Criar e Atribuir Tarefa</Text>
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
    label: { fontSize: 18, color: '#fff', marginBottom: 10, alignSelf: 'flex-start' },
    input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
    pickerContainer: {
        width: '100%',
        backgroundColor: '#333',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden' // Garante que o Picker respeite o borderRadius no Android
    },
    picker: {
        color: '#fff',
        height: 60, // Altura padrão para inputs
    },
    button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginVertical: 20 },
    buttonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
    backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
    backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
});