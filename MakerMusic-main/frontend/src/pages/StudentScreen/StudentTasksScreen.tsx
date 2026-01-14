import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { getTasksByStudent, updateTaskStatus } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function StudentTasksScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { showSuccess, showError } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (user && token) {
      try {
        setIsLoading(true);
        const data = await getTasksByStudent(user.id, token);
        if (Array.isArray(data)) { setTasks(data); }
      } finally { setIsLoading(false); }
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  const executeUpdate = async () => {
    if (!selectedTaskId || !token) return;
    try {
      const response = await updateTaskStatus(selectedTaskId, true, token);
      if (response.message === 'Tarefa atualizada com sucesso!') {
        showSuccess("Tarefa concluída!");
        fetchTasks(); 
      }
    } finally { setConfirmVisible(false); setSelectedTaskId(null); }
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
            {!item.completed && (
              <TouchableOpacity style={styles.completeButton} onPress={() => { setSelectedTaskId(item.id); setConfirmVisible(true); }}>
                <Text style={styles.completeButtonText}>Concluir</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backButtonText}>Voltar</Text></TouchableOpacity>
      <ConfirmModal visible={confirmVisible} title="Confirmar" message="Marcar como concluída?" onConfirm={executeUpdate} onCancel={() => setConfirmVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f', 
    padding: 20, 
    width: '100%' 
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 20, 
    marginTop: 40, 
    textAlign: 'center' 
  },
  loadingText: {
    color: '#d4af37', 
    marginTop: 10 
  },
  taskItem: { 
    backgroundColor: '#333', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    width: '100%', 
    maxWidth: 600, 
    alignSelf: 'center' 
  },
  taskItemCompleted: { 
    backgroundColor: '#2a4d2a' 
  }, 
  taskTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  completeButton: { 
    backgroundColor: '#d4af37', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 15, 
    alignItems: 'center' 
  },
  completeButtonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold' 
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
  }
});
