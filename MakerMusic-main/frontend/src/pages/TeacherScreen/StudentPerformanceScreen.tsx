import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, ScrollView, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getStudentPerformance } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

export default function StudentPerformanceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useUser();
  const { studentId, studentName } = route.params as any;
  const [performance, setPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPerformance = useCallback(async () => {
    if (token && studentId) {
      try {
        setIsLoading(true);
        const data = await getStudentPerformance(studentId, token);
        setPerformance(data);
      } finally { setIsLoading(false); }
    }
  }, [studentId, token]);

  useFocusEffect(useCallback(() => { fetchPerformance(); }, [fetchPerformance]));

  const completionRate = performance && performance.total > 0 
    ? Math.round((performance.completed / performance.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconButton}>
          <Ionicons name="chevron-back" size={28} color="#d4af37" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Desempenho</Text>
          <Text style={styles.headerSubtitle}>{studentName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.totalCard]}>
            <View style={styles.statIcon}>
              <Ionicons name="list" size={24} color="#64b5f6" />
            </View>
            <Text style={styles.statValue}>{performance?.total || 0}</Text>
            <Text style={styles.statLabel}>Total de Tarefas</Text>
          </View>
          
          <View style={[styles.statCard, styles.completedCard]}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-done" size={24} color="#81c784" />
            </View>
            <Text style={styles.statValue}>{performance?.completed || 0}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          
          <View style={[styles.statCard, styles.performanceCard]}>
            <View style={styles.statIcon}>
              <Ionicons name="trophy" size={24} color="#ffd54f" />
            </View>
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Taxa de Conclusão</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progresso Geral</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
          </View>
          <Text style={styles.progressText}>{performance?.completed || 0} de {performance?.total || 0} tarefas completas</Text>
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Histórico de Atividades</Text>
          {performance?.tasks && performance.tasks.length > 0 ? (
            performance.tasks.map((item: any, index: number) => (
              <View key={index} style={[styles.taskCard, item.completed ? styles.taskCompletedBorder : styles.taskPendingBorder]}>
                <View style={styles.taskHeader}>
                  <View style={[styles.taskStatusIcon, { backgroundColor: item.completed ? '#4CAF50' : '#FF9800' }]}>
                    <Ionicons name={item.completed ? "checkmark" : "time"} size={18} color="#fff" />
                  </View>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                </View>
                <Text style={styles.taskDescription}>{item.description || 'Sem descrição'}</Text>
                <View style={styles.taskFooter}>
                  <View style={[styles.statusChip, { backgroundColor: item.completed ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)' }]}>
                    <Text style={[styles.statusChipText, { color: item.completed ? '#81c784' : '#ffb74d' }]}>
                      {item.completed ? '✓ Concluída' : '○ Pendente'}
                    </Text>
                  </View>
                  {item.completed && item.completed_at && (
                    <Text style={styles.completedDate}>
                      {new Date(item.completed_at).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color="#444" />
              <Text style={styles.emptyText}>Nenhuma atividade registrada ainda</Text>
              <Text style={styles.emptySubtext}>As tarefas do aluno aparecerão aqui</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#2a292e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backIconButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f6e27f',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: isLargeScreen ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    backgroundColor: '#2a292e',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: isLargeScreen ? 1 : undefined,
    borderWidth: 1,
    borderColor: '#333',
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#64b5f6',
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#81c784',
  },
  performanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffd54f',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: '#2a292e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#1c1b1f',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
  },
  tasksSection: {
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: '#2a292e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  taskCompletedBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  taskPendingBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskStatusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
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
  completedDate: {
    color: '#666',
    fontSize: 12,
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