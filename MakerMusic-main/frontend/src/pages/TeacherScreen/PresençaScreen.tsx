import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { useUser } from '../src/UserContext';
import { getSchedulesForTeacherByDay, markAttendance } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function PresencaScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { showError, showSuccess, showToast } = useToast();
  const [selectedDay, setSelectedDay] = useState<string>('SEGUNDA');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (day: string) => {
    if (token) {
      setIsLoading(true);
      try {
        const data = await getSchedulesForTeacherByDay(day, token);
        if(Array.isArray(data)) { 
          setSchedules(data); 
        }
      } catch (error) {
        showError("Erro ao carregar horários.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [token, showError]);

  useFocusEffect(useCallback(() => { 
    fetchSchedules(selectedDay); 
  }, [selectedDay, fetchSchedules]));

  const handleMarkAttendance = async (scheduleId: string, studentId: string, status: string) => {
    if (!token) return;
    
    setMarkingId(scheduleId);
    try {
      const attendanceData = {
        scheduleId,
        studentId,
        status,
        classDate: new Date().toISOString().split('T')[0]
      };
      
      const response = await markAttendance(attendanceData, token);
      
      if (response.attendanceId || response.message?.includes('sucesso')) {
        if (status === 'PRESENTE') {
          showToast("Presença atribuída", 'success');
        } else if (status === 'AUSENTE') {
          showToast("Falta atribuída", 'error');
        } else if (status === 'JUSTIFICADO') {
          showToast("Ausência Justificada", 'warning');
        }
        
        setSchedules(prev => prev.map(item => 
          item.id === scheduleId ? { ...item, attendance_status: status } : item
        ));
      } else {
        showError(response.message || "Erro ao marcar presença.");
      }
    } catch (error) {
      showError("Erro de conexão com o servidor.");
    } finally {
      setMarkingId(null);
    }
  };

  const getDayLabel = (day: string) => {
    const labels: any = {
      'SEGUNDA': 'SEG',
      'TERCA': 'TER',
      'QUARTA': 'QUA',
      'QUINTA': 'QUI',
      'SEXTA': 'SEX',
      'SABADO': 'SÁB',
      'DOMINGO': 'DOM'
    };
    return labels[day] || day;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="checkmark-done-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Lista de Presença</Text>
          </View>
        </View>

        <View style={styles.daySelectorContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelectorContent}
          >
            {['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'].map((day) => (
              <TouchableOpacity 
                key={day}
                style={[styles.dayButton, selectedDay === day && styles.selectedDayButton]} 
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayButtonText, selectedDay === day && styles.selectedDayButtonText]}>
                  {getDayLabel(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#f6e27f" />
            <Text style={styles.loadingText}>Carregando horários...</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
          >
            {schedules.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={80} color="#666" />
                <Text style={styles.emptyText}>Nenhuma aula agendada</Text>
                <Text style={styles.emptySubtext}>Não há horários para {getDayLabel(selectedDay)}</Text>
              </View>
            ) : (
              <View style={styles.schedulesContainer}>
                {schedules.map((item) => (
                  <View key={item.id.toString()} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <View style={styles.studentInfo}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{item.student_name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.studentDetails}>
                          <Text style={styles.studentName}>{item.student_name}</Text>
                          <View style={styles.timeContainer}>
                            <Ionicons name="time-outline" size={16} color="#aaa" />
                            <Text style={styles.timeText}>
                              {item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.attendanceSection}>
                      <Text style={styles.attendanceLabel}>Marcar presença:</Text>
                      <View style={styles.attendanceButtons}>
                        <TouchableOpacity 
                          disabled={markingId === item.id}
                          style={[
                            styles.statusButton, 
                            styles.presenteButton,
                            item.attendance_status === 'PRESENTE' && styles.presenteActive,
                            { opacity: markingId === item.id ? 0.5 : 1 }
                          ]} 
                          onPress={() => handleMarkAttendance(item.id, item.student_id, 'PRESENTE')}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={item.attendance_status === 'PRESENTE' ? "checkmark-circle" : "checkmark-circle-outline"} 
                            size={24} 
                            color={item.attendance_status === 'PRESENTE' ? "#fff" : "#81c784"} 
                          />
                          <Text style={[
                            styles.statusButtonText,
                            item.attendance_status === 'PRESENTE' && styles.statusButtonTextActive
                          ]}>Presente</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          disabled={markingId === item.id}
                          style={[
                            styles.statusButton, 
                            styles.ausenteButton,
                            item.attendance_status === 'AUSENTE' && styles.ausenteActive,
                            { opacity: markingId === item.id ? 0.5 : 1 }
                          ]} 
                          onPress={() => handleMarkAttendance(item.id, item.student_id, 'AUSENTE')}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={item.attendance_status === 'AUSENTE' ? "close-circle" : "close-circle-outline"} 
                            size={24} 
                            color={item.attendance_status === 'AUSENTE' ? "#fff" : "#e57373"} 
                          />
                          <Text style={[
                            styles.statusButtonText,
                            item.attendance_status === 'AUSENTE' && styles.statusButtonTextActive
                          ]}>Falta</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          disabled={markingId === item.id}
                          style={[
                            styles.statusButton, 
                            styles.justificadoButton,
                            item.attendance_status === 'JUSTIFICADO' && styles.justificadoActive,
                            { opacity: markingId === item.id ? 0.5 : 1 }
                          ]} 
                          onPress={() => handleMarkAttendance(item.id, item.student_id, 'JUSTIFICADO')}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={item.attendance_status === 'JUSTIFICADO' ? "alert-circle" : "alert-circle-outline"} 
                            size={24} 
                            color={item.attendance_status === 'JUSTIFICADO' ? "#fff" : "#ffb74d"} 
                          />
                          <Text style={[
                            styles.statusButtonText,
                            item.attendance_status === 'JUSTIFICADO' && styles.statusButtonTextActive
                          ]}>Justificado</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
  daySelectorContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  daySelectorContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dayButton: { 
    paddingVertical: 10,
    paddingHorizontal: 18, 
    borderRadius: 20, 
    backgroundColor: '#2a292e',
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 65,
    alignItems: 'center',
  },
  selectedDayButton: { 
    backgroundColor: '#f6e27f',
    borderColor: '#f6e27f',
  },
  dayButtonText: { 
    color: '#aaa', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedDayButtonText: {
    color: '#1c1b1f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  schedulesContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 15,
  },
  scheduleCard: { 
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
  scheduleHeader: {
    marginBottom: 15,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f6e27f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
    fontSize: 20,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: { 
    color: '#aaa', 
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginBottom: 15,
  },
  attendanceSection: {
    gap: 12,
  },
  attendanceLabel: {
    color: '#f6e27f',
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceButtons: { 
    flexDirection: 'row', 
    gap: 10,
    flexWrap: 'wrap',
  },
  statusButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    flex: 1,
    minWidth: 110,
  },
  presenteButton: {
    backgroundColor: '#81c78420',
    borderColor: '#81c784',
  },
  presenteActive: {
    backgroundColor: '#81c784',
    borderColor: '#81c784',
  },
  ausenteButton: {
    backgroundColor: '#e5737320',
    borderColor: '#e57373',
  },
  ausenteActive: {
    backgroundColor: '#e57373',
    borderColor: '#e57373',
  },
  justificadoButton: {
    backgroundColor: '#ffb74d20',
    borderColor: '#ffb74d',
  },
  justificadoActive: {
    backgroundColor: '#ffb74d',
    borderColor: '#ffb74d',
  },
  statusButtonText: { 
    color: '#aaa', 
    fontWeight: '600',
    fontSize: 13,
  },
  statusButtonTextActive: {
    color: '#fff',
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
