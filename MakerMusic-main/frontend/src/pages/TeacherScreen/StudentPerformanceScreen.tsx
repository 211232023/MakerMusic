import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getStudentPerformance } from '../../services/api';

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
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Desempenho do Aluno</Text>
        <Text style={styles.studentNameHeader}>{studentName}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{performance?.total || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{performance?.completed || 0}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Desempenho</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Histórico de Atividades</Text>
        <FlatList
          data={performance?.tasks}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.taskItem, item.completed ? styles.taskCompleted : styles.taskPending]}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskStatusText}>{item.completed ? 'Concluída' : 'Pendente'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.completed ? '#2e7d32' : '#ef6c00' }]}>
                <Text style={styles.statusBadgeText}>{item.completed ? 'OK' : '...'}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade registrada.</Text>}
        />
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f', 
  },
  contentContainer: { 
    flex: 1,
    width: '100%', 
    maxWidth: 600, 
    alignSelf: 'center', 
    paddingHorizontal: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginTop: 40, 
    textAlign: 'center' 
  },
  studentNameHeader: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8
  },
  subtitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 15 
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 30, 
    width: '100%' 
  },
  statBox: { 
    backgroundColor: '#333', 
    padding: 15, 
    borderRadius: 12, 
    width: '31%', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444'
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#d4af37' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#aaa',
    marginTop: 4
  },
  taskItem: { 
    backgroundColor: '#2a292e', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333'
  },
  taskCompleted: { 
    borderLeftWidth: 5, 
    borderLeftColor: '#4CAF50' 
  },
  taskPending: { 
    borderLeftWidth: 5, 
    borderLeftColor: '#FF9800' 
  },
  taskInfo: {
    flex: 1
  },
  taskTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  taskStatusText: { 
    color: '#aaa', 
    fontSize: 13,
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic'
  },
  backButton: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center',
    backgroundColor: 'rgba(28, 27, 31, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#d4af37'
  },
  backButtonText: { 
    color: '#d4af37', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});