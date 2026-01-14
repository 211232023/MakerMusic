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

const DAYS_OF_WEEK = [
  { label: 'Segunda-feira', value: 'SEGUNDA' },
  { label: 'Terça-feira', value: 'TERCA' },
  { label: 'Quarta-feira', value: 'QUARTA' },
  { label: 'Quinta-feira', value: 'QUINTA' },
  { label: 'Sexta-feira', value: 'SEXTA' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' },
];

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { showError, showSuccess } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>('SEGUNDA');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activity, setActivity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const loadStudents = useCallback(async () => {
    if (user && token) {
      setIsLoadingStudents(true);
      const studentList = await getStudentsByTeacher(user.id, token);
      if (Array.isArray(studentList)) {
        setStudents(studentList);
      }
      setIsLoadingStudents(false);
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => {
    loadStudents();
  }, [loadStudents]));

  const resetFields = () => {
    setSelectedStudentId(null);
    setSelectedDay('SEGUNDA');
    setStartTime('');
    setEndTime('');
    setActivity('');
  };

  const handleCreateSchedule = async () => {
    if (!selectedStudentId || !startTime.trim() || !endTime.trim() || !activity.trim() || !selectedDay) {
      showError('Por favor, preencha todos os campos, incluindo a atividade.');
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

    const response = await createSchedule(scheduleData, token);
    setIsLoading(false);

    if (response.scheduleId) {
      showSuccess('Horário criado com sucesso!');
      resetFields();
    } else {
      showError(response.message || 'Não foi possível criar o horário.');
    }
  };

  const studentItems = [
    { label: 'Selecione um aluno...', value: null },
    ...students.map(student => ({
      label: student.name,
      value: student.id,
    }))
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Criar Novo Horário</Text>

          {isLoadingStudents ? (
            <ActivityIndicator color="#d4af37" />
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Aula</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Aula pratica de violão"
                placeholderTextColor="#aaa"
                value={activity}
                onChangeText={setActivity}
                multiline
                numberOfLines={3}
              />

              <View style={styles.fieldSpacing}>
                <Text style={styles.label}>Atribuir para o Aluno:</Text>
                <CustomPicker
                  selectedValue={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  items={studentItems}
                />
              </View>

              <View style={styles.fieldSpacing}>
                <Text style={styles.label}>Dia da Semana:</Text>
                <CustomPicker
                  selectedValue={selectedDay}
                  onValueChange={setSelectedDay}
                  items={DAYS_OF_WEEK}
                />
              </View>

              <View style={[styles.row, styles.fieldSpacing]}>
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
            </View>
          )}

          {isLoading ? (
            <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleCreateSchedule}>
              <Text style={styles.buttonText}>Salvar Horário</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Cancelar</Text>
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
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 30, 
    marginTop: 40, 
    textAlign: 'center' 
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: { 
    fontSize: 16, 
    color: '#f6e27f', 
    marginBottom: 10, 
    alignSelf: 'flex-start', 
    fontWeight: 'bold'
  },
  fieldSpacing: {
    marginTop: 25,
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
    backgroundColor: '#2a292e', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: { 
    backgroundColor: '#d4af37', 
    padding: 15, 
    borderRadius: 10, 
    width: '100%', 
    maxWidth: 400,
    alignItems: 'center', 
    marginTop: 40 
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  backButton: { 
    marginTop: 30,
    marginBottom: 40,
    alignSelf: 'center' 
  },
  backButtonText: { 
    color: '#d4af37', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});