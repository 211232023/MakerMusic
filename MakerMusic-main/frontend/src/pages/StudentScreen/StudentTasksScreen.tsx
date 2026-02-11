import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, Platform, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { getTasksByStudent, updateTaskStatus } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

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

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#f6e27f" />
          <Text style={styles.loadingText}>A carregar as suas tarefas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1b1f" />
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="clipboard" size={32} color="#f6e27f" />
            <Text style={styles.title}>Minhas Tarefas</Text>
          </View>
          <Text style={styles.subtitle}>{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} no total</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: '#ffb74d' }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 183, 77, 0.2)' }]}>
              <Ionicons name="time" size={28} color="#ffb74d" />
            </View>
            <Text style={styles.statValue}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#81c784' }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(129, 199, 132, 0.2)' }]}>
              <Ionicons name="checkmark-done" size={28} color="#81c784" />
            </View>
            <Text style={styles.statValue}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, item.completed ? styles.taskCompleted : styles.taskPending]}>
              <View style={styles.taskHeader}>
                <View style={[styles.taskStatusIcon, { backgroundColor: item.completed ? '#4CAF50' : '#FF9800' }]}>
                  <Ionicons name={item.completed ? "checkmark" : "time"} size={24} color="#fff" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.taskDescription}>{item.description}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.taskFooter}>
                <View style={[styles.statusChip, { backgroundColor: item.completed ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)' }]}>
                  <Text style={[styles.statusChipText, { color: item.completed ? '#81c784' : '#ffb74d' }]}>
                    {item.completed ? 'Concluída' : 'Pendente'}
                  </Text>
                </View>
                {!item.completed && (
                  <TouchableOpacity 
                    style={styles.completeButton} 
                    onPress={() => { setSelectedTaskId(item.id); setConfirmVisible(true); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#1c1b1f" />
                    <Text style={styles.completeButtonText}>Concluir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={60} color="#444" />
              <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
              <Text style={styles.emptySubtext}>Suas tarefas aparecerão aqui</Text>
            </View>
          }
        />
        <ConfirmModal visible={confirmVisible} title="Confirmar" message="Marcar como concluída?" onConfirm={executeUpdate} onCancel={() => setConfirmVisible(false)} />
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
    padding: 20,
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    color: '#aaa', 
    marginTop: 15,
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 8,
    paddingVertical: 8,
  },
  backText: {
    color: '#f6e27f',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  statCard: {
    backgroundColor: '#2a292e',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  taskCard: {
    backgroundColor: '#2a292e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  taskCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  taskPending: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  taskStatusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completeButton: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 18,
    borderRadius: 12, 
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});
