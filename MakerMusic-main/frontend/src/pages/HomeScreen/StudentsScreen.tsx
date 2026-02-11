import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { getTasksByStudent, updateTaskStatus } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';

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
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#f6e27f" />
          <Text style={styles.loadingText}>Carregando suas tarefas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="clipboard-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Minhas Tarefas</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
              <Text style={styles.emptySubtext}>Você está em dia com suas atividades!</Text>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {tasks.map((item) => (
                <View 
                  key={item.id.toString()} 
                  style={[styles.taskCard, item.completed && styles.taskCardCompleted]}
                >
                  <View style={styles.taskHeader}>
                    <View style={[
                      styles.statusBadge, 
                      item.completed ? styles.statusCompleted : styles.statusPending
                    ]}>
                      <Ionicons 
                        name={item.completed ? "checkmark-circle" : "time-outline"} 
                        size={20} 
                        color={item.completed ? "#81c784" : "#ffb74d"} 
                      />
                      <Text style={[
                        styles.statusText,
                        item.completed ? styles.statusTextCompleted : styles.statusTextPending
                      ]}>
                        {item.completed ? "Concluída" : "Pendente"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.taskTitle}>{item.title}</Text>
                  
                  {item.description && (
                    <Text style={styles.taskDescription}>{item.description}</Text>
                  )}

                  {!item.completed && (
                    <TouchableOpacity 
                      style={styles.completeButton} 
                      onPress={() => { 
                        setSelectedTaskId(item.id); 
                        setConfirmVisible(true); 
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#1c1b1f" />
                      <Text style={styles.completeButtonText}>Marcar como Concluída</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <ConfirmModal 
          visible={confirmVisible} 
          title="Confirmar Conclusão" 
          message="Deseja marcar esta tarefa como concluída?" 
          onConfirm={executeUpdate} 
          onCancel={() => setConfirmVisible(false)} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f',
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#f6e27f',
  },
  loadingText: {
    color: '#aaa', 
    marginTop: 15,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  tasksContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 15,
  },
  taskCard: { 
    backgroundColor: '#2a292e', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  taskCardCompleted: { 
    borderColor: '#81c784',
    backgroundColor: '#2a3a2a',
  }, 
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusPending: {
    backgroundColor: '#ffb74d20',
  },
  statusCompleted: {
    backgroundColor: '#81c78420',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#ffb74d',
  },
  statusTextCompleted: {
    color: '#81c784',
  },
  taskTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskDescription: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  completeButton: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14, 
    borderRadius: 12, 
    marginTop: 10,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});