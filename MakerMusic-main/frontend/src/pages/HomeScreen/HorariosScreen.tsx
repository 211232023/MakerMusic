import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMySchedules } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const daysOfWeekMap: { [key: string]: string } = {
  'monday': 'Segunda-feira',
  'tuesday': 'Terça-feira',
  'wednesday': 'Quarta-feira',
  'thursday': 'Quinta-feira',
  'friday': 'Sexta-feira',
  'saturday': 'Sábado',
  'sunday': 'Domingo',
};

const dayColors: { [key: string]: string } = {
  'monday': '#64b5f6',
  'tuesday': '#81c784',
  'wednesday': '#ffb74d',
  'thursday': '#ba68c8',
  'friday': '#e57373',
  'saturday': '#4dd0e1',
  'sunday': '#ffd54f',
};

export default function HorariosScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    if (token) {
      try {
        setIsLoading(true);
        const data = await getMySchedules(token);
        if (Array.isArray(data)) { setSchedules(data); }
      } finally { setIsLoading(false); }
    }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchSchedules(); }, [fetchSchedules]));

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
            <Ionicons name="calendar-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Meus Horários</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f6e27f" />
            <Text style={styles.loadingText}>Carregando horários...</Text>
          </View>
        ) : (
          <FlatList
            data={schedules}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
            renderItem={({ item }) => {
              const dayKey = item.day_of_week.toLowerCase();
              const dayColor = dayColors[dayKey] || '#64b5f6';
              const dayName = daysOfWeekMap[dayKey] || item.day_of_week;

              return (
                <View style={styles.scheduleCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.dayBadge, { backgroundColor: `${dayColor}20` }]}>
                      <Ionicons name="calendar" size={20} color={dayColor} />
                      <Text style={[styles.dayText, { color: dayColor }]}>{dayName}</Text>
                    </View>
                  </View>

                  <View style={styles.timeContainer}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={20} color="#aaa" />
                      <Text style={styles.timeLabel}>Horário:</Text>
                      <Text style={styles.timeText}>
                        {`${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.teacherContainer}>
                    <Ionicons name="person-outline" size={20} color="#aaa" />
                    <Text style={styles.teacherLabel}>Professor:</Text>
                    <Text style={styles.teacherText}>{item.teacher_name}</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={80} color="#666" />
                <Text style={styles.emptyText}>Nenhum horário definido</Text>
                <Text style={styles.emptySubtext}>Seus horários de aula aparecerão aqui</Text>
              </View>
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 15,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scheduleCard: { 
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  cardHeader: {
    marginBottom: 15,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  dayText: { 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  timeText: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: '600',
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  teacherLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  teacherText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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