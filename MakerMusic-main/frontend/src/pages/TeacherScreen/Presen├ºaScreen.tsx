import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useUser } from '../src/UserContext';
import { getSchedulesForTeacherByDay, markAttendance } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

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
        status, // 'PRESENTE', 'AUSENTE', 'JUSTIFICADO'
        classDate: new Date().toISOString().split('T')[0] // Corrigido para classDate conforme backend
      };
      
      const response = await markAttendance(attendanceData, token);
      
      if (response.attendanceId || response.message?.includes('sucesso')) {
        // Personalização das mensagens e cores conforme solicitado
        if (status === 'PRESENTE') {
          showToast("Presença atribuída", 'success');
        } else if (status === 'AUSENTE') {
          showToast("Falta atribuída", 'error');
        } else if (status === 'JUSTIFICADO') {
          showToast("Ausência Justificada", 'warning');
        }
        
        // Atualiza o estado local para refletir a mudança visualmente
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Lista de Presença</Text>
      
      <View style={styles.daySelectorContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.dayButton, selectedDay === item && styles.selectedDayButton]} 
              onPress={() => setSelectedDay(item)}
            >
              <Text style={[styles.dayButtonText, selectedDay === item && styles.selectedDayButtonText]}>
                {item.substring(0,3)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.daySelectorContent}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.student_name}</Text>
                <Text style={styles.timeText}>{item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}</Text>
              </View>
              
              <View style={styles.attendanceButtons}>
                <TouchableOpacity 
                  disabled={markingId === item.id}
                  style={[
                    styles.statusButton, 
                    item.attendance_status === 'PRESENTE' && styles.presente,
                    { opacity: markingId === item.id ? 0.5 : 1 }
                  ]} 
                  onPress={() => handleMarkAttendance(item.id, item.student_id, 'PRESENTE')}
                >
                  <Text style={styles.statusButtonText}>P</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  disabled={markingId === item.id}
                  style={[
                    styles.statusButton, 
                    item.attendance_status === 'AUSENTE' && styles.ausente,
                    { opacity: markingId === item.id ? 0.5 : 1 }
                  ]} 
                  onPress={() => handleMarkAttendance(item.id, item.student_id, 'AUSENTE')}
                >
                  <Text style={styles.statusButtonText}>F</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  disabled={markingId === item.id}
                  style={[
                    styles.statusButton, 
                    item.attendance_status === 'JUSTIFICADO' && styles.justificado,
                    { opacity: markingId === item.id ? 0.5 : 1 }
                  ]} 
                  onPress={() => handleMarkAttendance(item.id, item.student_id, 'JUSTIFICADO')}
                >
                  <Text style={styles.statusButtonText}>J</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma aula agendada para este dia.</Text>
            </View>
          }
        />
      )}
      
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
  centerContainer: {
    flex: 1,
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
  daySelectorContainer: {
    height: 60,
    marginBottom: 20,
    width: '100%',
  },
  daySelectorContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center' // Centraliza os itens horizontalmente
  },
  dayButton: { 
    paddingVertical: 10,
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: '#333',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 60,
    alignItems: 'center'
  },
  selectedDayButton: { 
    backgroundColor: '#d4af37',
    borderColor: '#f6e27f'
  },
  dayButtonText: { 
    color: '#aaa', 
    fontWeight: 'bold',
    fontSize: 14
  },
  selectedDayButtonText: {
    color: '#1c1b1f'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  scheduleItem: { 
    backgroundColor: '#2a292e', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  studentInfo: {
    flex: 1
  },
  studentName: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: 'bold'
  },
  timeText: { 
    color: '#aaa', 
    fontSize: 14,
    marginTop: 4
  },
  attendanceButtons: { 
    flexDirection: 'row', 
    alignItems: 'center'
  },
  statusButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8, 
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#555'
  },
  presente: { 
    backgroundColor: '#2e7d32',
    borderColor: '#4CAF50'
  },
  ausente: { 
    backgroundColor: '#c62828',
    borderColor: '#f44336'
  },
  justificado: {
    backgroundColor: '#f57c00',
    borderColor: '#ff9800'
  },
  statusButtonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center'
  },
  emptyText: {
    color: '#aaa',
    fontStyle: 'italic',
    fontSize: 16
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