import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getTasksByStudent, updateTaskStatus } from '../../services/api';

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  completed?: boolean; 
};

export default function StudentTasksScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user || !token) return;
    try {
      setIsLoading(true);
      const data = await getTasksByStudent(user.id, token);
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as suas tarefas.");
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  const handleMarkAsComplete = (taskId: string) => {
    Alert.alert(
      "Confirmar Conclusão",
      "Tem certeza de que deseja marcar esta tarefa como concluída?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, concluí!", 
          onPress: async () => {
            if (!token) return;
            const response = await updateTaskStatus(taskId, true, token);
            if (response.message === 'Tarefa atualizada com sucesso!') {
              Alert.alert("Sucesso", "Tarefa marcada como concluída!");
              fetchTasks(); 
            } else {
              Alert.alert("Erro", response.message || "Não foi possível atualizar a tarefa.");
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>A carregar as suas tarefas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Tarefas</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.taskItem, item.completed && styles.taskItemCompleted]}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            {item.due_date && <Text style={styles.taskDueDate}>Entregar até: {new Date(item.due_date).toLocaleDateString()}</Text>}
            
            {!item.completed && (
                 <TouchableOpacity style={styles.completeButton} onPress={() => handleMarkAsComplete(item.id)}>
                    <Text style={styles.completeButtonText}>Marcar como Concluída</Text>
                </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Você não tem nenhuma tarefa pendente. Bom trabalho!</Text>}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 20, marginTop: 40, textAlign: 'center' },
    loadingText: { marginTop: 10, color: '#f6e27f' },
    taskItem: { backgroundColor: '#333', padding: 15, borderRadius: 10, marginBottom: 10 },
    taskItemCompleted: { backgroundColor: '#2a4d2a' }, 
    taskTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    taskDueDate: { color: '#ccc', fontSize: 14, marginTop: 5 },
    completeButton: { backgroundColor: '#d4af37', padding: 10, borderRadius: 5, marginTop: 15, alignItems: 'center' },
    completeButtonText: { color: '#1c1b1f', fontWeight: 'bold' },
    emptyText: { color: '#aaa', textAlign: 'center', marginTop: 50, fontSize: 16 },
    backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
    backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
});