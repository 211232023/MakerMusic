import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getStudentsByTeacher, createSchedule } from '../../services/api';
import CustomPicker from '../../components/CustomPicker';
import { useToast } from '../../contexts/ToastContext'; 

type Student = {
  id: string;
  name: string;
};

const DAYS_OF_WEEK = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { showError, showSuccess } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activity, setActivity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const loadStudents = useCallback(async () => {
    if (user && token) {
      setIsLoadingStudents(true);
      try {
        const studentList = await getStudentsByTeacher(user.id, token);
        if (Array.isArray(studentList)) {
          setStudents(studentList);
        }
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => {
    loadStudents();
  }, [loadStudents]));

  const handleCreateSchedule = async () => {
    if (!selectedStudentId || !selectedDay || !startTime.trim() || !endTime.trim() || !activity.trim()) {
      showError('Por favor, preencha todos os campos.');
      return;
    }
    if (!token) return;

    setIsLoading(true);
    const scheduleData = {
      studentId: selectedStudentId,
      dayOfWeek: selectedDay,
      startTime,
      endTime,
      activity,
    };

    try {
      const response = await createSchedule(scheduleData, token);
      setIsLoading(false);

      if (response.scheduleId) {
        showSuccess('Horário criado com sucesso!');
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        showError(response.message || 'Não foi possível criar o horário.');
      }
    } catch (error) {
      setIsLoading(false);
      showError('Erro de conexão com o servidor.');
    }
  };

  const studentItems = [
    { label: 'Selecione um aluno...', value: null },
    ...students.map(student => ({
      label: student.name,
      value: student.id,
    }))
  ];

  const dayItems = DAYS_OF_WEEK.map(day => ({
    label: day,
    value: day,
  }));

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Criar Novo Horário</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Aula pratica de violão"
              placeholderTextColor="#aaa"
              value={activity}
              onChangeText={setActivity}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Atribuir para o Aluno:</Text>
              {isLoadingStudents ? (
                <ActivityIndicator color="#d4af37" />
              ) : (
                <CustomPicker
                  selectedValue={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  items={studentItems}
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dia da Semana:</Text>
              <CustomPicker
                selectedValue={selectedDay}
                onValueChange={setSelectedDay}
                items={dayItems}
              />
            </View>

            <View style={[styles.row, styles.fieldGroup]}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Hora de Início:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor="#aaa"
                  value={startTime}
                  onChangeText={setStartTime}
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Hora de Fim:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor="#aaa"
                  value={endTime}
                  onChangeText={setEndTime}
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleCreateSchedule}>
                <Text style={styles.buttonText}>Salvar Horário</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center' 
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 600, 
    alignSelf: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 30, 
    marginTop: 40, 
    textAlign: 'center' 
  },
  fieldGroup: {
    marginBottom: 25, // Aumentando o espaçamento entre os grupos de campos
  },
  label: { 
    fontSize: 18, 
    color: '#fff', 
    marginBottom: 10 
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfInput: {
    width: '48%',
  },
  input: { 
    width: '100%', 
    backgroundColor: '#333', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 16 
  },
  button: { 
    backgroundColor: '#d4af37', 
    padding: 15, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: 'center', 
    marginVertical: 20 
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  backButton: { 
    marginTop: 20,
    marginBottom: 40,
    alignSelf: 'center' 
  },
  backButtonText: { 
    color: '#d4af37', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});