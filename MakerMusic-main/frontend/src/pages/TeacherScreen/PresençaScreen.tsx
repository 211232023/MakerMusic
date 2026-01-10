import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from '../src/UserContext';
import { getSchedulesForTeacherByDay, markAttendance } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

type ScheduleItem = {
  id: number;
  start_time: string;
  end_time: string;
  student_id: number;
  student_name: string;
  attendance_status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO' | null;
};

const DAYS_OF_WEEK = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];

export default function PresencaScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { showError, showSuccess } = useToast();
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = useCallback(async (day: string) => {
    if (user && token) {
      setIsLoading(true);
      const data = await getSchedulesForTeacherByDay(day, token);
      if(Array.isArray(data)) {
        setSchedules(data);
      }
      setIsLoading(false);
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => {
    fetchSchedules(selectedDay);
  }, [selectedDay, fetchSchedules]));

  const handleMarkAttendance = async (scheduleId: number, studentId: number, status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO') => {
    if (!token) return;

    const today = new Date().toISOString().split('T')[0];

    const attendanceData = {
        scheduleId,
        studentId,
        classDate: today,
        status,
    };
    
    const response = await markAttendance(attendanceData, token);
    if (response.message) {
        setSchedules(prev => prev.map(item => 
            item.id === scheduleId ? { ...item, attendance_status: status } : item
        ));
        showSuccess("Presença registada com sucesso!");
    } else {
        showError("Não foi possível registar a presença.");
    }
  };
  
  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.studentName}>{item.student_name}</Text>
      <Text style={styles.timeText}>{`${item.start_time.substring(0,5)} - ${item.end_time.substring(0,5)}`}</Text>
      <View style={styles.attendanceButtons}>
        {['PRESENTE', 'AUSENTE', 'JUSTIFICADO'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              item.attendance_status === status && styles.selectedStatusButton,
              status === 'PRESENTE' && styles.presente,
              status === 'AUSENTE' && styles.ausente,
              status === 'JUSTIFICADO' && styles.justificado,
            ]}
            onPress={() => handleMarkAttendance(item.id, item.student_id, status as any)}
          >
            <Text style={styles.statusButtonText}>{status[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registo de Presença</Text>
      <View style={styles.daySelector}>
        {DAYS_OF_WEEK.map(day => (
          <TouchableOpacity 
            key={day} 
            style={[styles.dayButton, selectedDay === day && styles.selectedDayButton]} 
            onPress={() => setSelectedDay(day)}
          >
            <Text style={styles.dayButtonText}>{day.substring(0,3)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" />
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma aula agendada para este dia.</Text>}
        />
      )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#1c1b1f', 
      padding: 20 
    },
    title: { 
      fontSize: 28, 
      fontWeight: 'bold', 
      color: '#f6e27f', 
      marginBottom: 30, 
      marginTop: 40, 
      textAlign: 'center' 
    },
    daySelector: { 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      marginBottom: 20 
    },
    dayButton: { 
      padding: 10, 
      borderRadius: 20, 
      backgroundColor: '#333' 
    },
    selectedDayButton: { 
      backgroundColor: '#d4af37' 
    },
    dayButtonText: { 
      color: '#fff', 
      fontWeight: 'bold' 
    },
    scheduleItem: { 
      backgroundColor: '#2a292e', 
      padding: 15, 
      borderRadius: 10, 
      marginBottom: 10, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    studentName: { 
      color: '#fff', 
      fontSize: 16, 
      flex: 1 
    },
    timeText: { 
      color: '#ccc', 
      fontSize: 14 
    },
    attendanceButtons: { 
      flexDirection: 'row', 
      marginLeft: 10 
    },
    statusButton: { 
      width: 30, 
      height: 30, 
      borderRadius: 15, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginHorizontal: 4, 
      borderWidth: 1, 
      borderColor: '#555' 
    },
    selectedStatusButton: { 
      borderWidth: 2, 
      borderColor: '#fff' 
    },
    presente: { 
      backgroundColor: 'green' 
    },
    ausente: { 
      backgroundColor: 'red' 
    },
    justificado: { 
      backgroundColor: 'orange' 
    },
    statusButtonText: { 
      color: '#fff', 
      fontWeight: 'bold' 
    },
    emptyText: { 
      color: '#aaa', 
      fontStyle: 'italic', 
      textAlign: 'center', 
      marginTop: 40 
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
    },
});