import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMyStudents, createSchedule } from '../../services/api';
import CustomPicker from '../../components/CustomPicker';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons'; 

type Student = {
  id: string;
  name: string;
  class_id: number;
  class_description: string;
  instrument_name: string;
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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>('SEGUNDA');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activity, setActivity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  
  const loadStudents = useCallback(async () => {
    if (user && token) {
      setIsLoadingStudents(true);
      const studentList = await getMyStudents(token);

      if (Array.isArray(studentList)) {
        setStudents(studentList);
      }
      setIsLoadingStudents(false);
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => {
    loadStudents();
  }, [loadStudents]));

  // Efeito para atualizar o aluno selecionado e suas informações automáticas
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(s => String(s.id) === String(selectedStudentId));
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
    }
  }, [selectedStudentId, students]);

  const resetFields = () => {
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setSelectedDay('SEGUNDA');
    setStartTime('');
    setEndTime('');
    setActivity('');
  };

  const handleCreateSchedule = async () => {
    if (
      !selectedStudentId || 
      !startTime.trim() || 
      !endTime.trim() || 
      !activity.trim() || 
      !selectedDay
    ) {
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
      value: String(student.id), 
    }))
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1b1f" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                <Ionicons name="calendar" size={32} color="#f6e27f" />
                <Text style={styles.title}>Criar Novo Horário</Text>
              </View>
              <Text style={styles.subtitle}>Defina o horário de aula para o aluno</Text>
            </View>

            {isLoadingStudents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6e27f" />
              </View>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="person-outline" size={22} color="#64b5f6" />
                    <Text style={styles.cardTitle}>Seleção de Aluno</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="people-outline" size={18} color="#f6e27f" />
                      <Text style={styles.label}>Aluno</Text>
                    </View>
                    <CustomPicker
                      selectedValue={selectedStudentId}
                      onValueChange={setSelectedStudentId}
                      items={studentItems}
                    />
                  </View>

                  {selectedStudent && (
                    <View style={styles.infoContainer}>
                      <View style={styles.infoRow}>
                        <Ionicons name="musical-note" size={18} color="#81c784" />
                        <Text style={styles.infoLabel}>Instrumento:</Text>
                        <Text style={styles.infoValue}>{selectedStudent.instrument_name}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Ionicons name="school" size={18} color="#ffb74d" />
                        <Text style={styles.infoLabel}>Turma:</Text>
                        <Text style={styles.infoValue}>{selectedStudent.class_description}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="time-outline" size={22} color="#81c784" />
                    <Text style={styles.cardTitle}>Detalhes da Aula</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="document-text-outline" size={18} color="#f6e27f" />
                      <Text style={styles.label}>Descrição da Aula</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Ex: Aula prática de escalas"
                      placeholderTextColor="#666"
                      value={activity}
                      onChangeText={setActivity}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="calendar-outline" size={18} color="#f6e27f" />
                      <Text style={styles.label}>Dia da Semana</Text>
                    </View>
                    <CustomPicker
                      selectedValue={selectedDay}
                      onValueChange={setSelectedDay}
                      items={DAYS_OF_WEEK}
                    />
                  </View>

                  <View style={styles.timeRow}>
                    <View style={styles.timeInputGroup}>
                      <View style={styles.labelContainer}>
                        <Ionicons name="play-outline" size={18} color="#f6e27f" />
                        <Text style={styles.label}>Início</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#666"
                        value={startTime}
                        onChangeText={setStartTime}
                        maxLength={5}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                    <View style={styles.timeInputGroup}>
                      <View style={styles.labelContainer}>
                        <Ionicons name="stop-outline" size={18} color="#f6e27f" />
                        <Text style={styles.label}>Fim</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#666"
                        value={endTime}
                        onChangeText={setEndTime}
                        maxLength={5}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </View>
                </View>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f6e27f" />
                    <Text style={styles.loadingText}>Salvando horário...</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={[styles.button, !selectedStudentId && styles.buttonDisabled]} 
                      onPress={handleCreateSchedule}
                      disabled={!selectedStudentId}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#1c1b1f" />
                      <Text style={styles.buttonText}>Salvar Horário</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={() => navigation.goBack()}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1c1b1f",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: { 
    flex: 1, 
    padding: 20, 
    width: '100%' 
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 30,
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
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
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
    textAlign: 'center',
  },
  loadingContainer: {
    marginVertical: 30,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#2a292e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3e',
  },
  cardTitle: {
    color: '#f6e27f',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: { 
    fontSize: 14, 
    color: '#f6e27f', 
    fontWeight: '600'
  },
  input: { 
    width: '100%', 
    backgroundColor: '#1c1b1f', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoContainer: {
    backgroundColor: '#1c1b1f',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#444',
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#f6e27f',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 15,
  },
  timeInputGroup: {
    flex: 1,
  },
  button: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#555',
    shadowColor: '#000',
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  cancelButton: { 
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: { 
    color: '#f6e27f', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});