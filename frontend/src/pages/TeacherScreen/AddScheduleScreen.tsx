import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMyStudents, createSchedule } from '../../services/api';
import { Picker } from '@react-native-picker/picker';

type Student = {
  id: string;
  name: string;
};

const DAYS_OF_WEEK = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];

export default function AddScheduleScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState(''); 
  
  const [endTime, setEndTime] = useState('');    

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

   const loadStudents = useCallback(async () => {
    if (user && token) {
      setIsLoadingStudents(true);
      const studentList = await getMyStudents(token);
      if (Array.isArray(studentList) && studentList.length > 0) {
        setStudents(studentList);
        // Não define o primeiro aluno como selecionado por padrão
      }
      setIsLoadingStudents(false);
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => {
    loadStudents();
  }, [loadStudents]));

  const handleCreateSchedule = async () => {
    if (!selectedStudentId || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Erro', 'Por favor, selecione um aluno e preencha os horários de início e fim.');
      return;
    }
    if (!token) return;

    setIsLoading(true);
    const scheduleData = {
      studentId: selectedStudentId,
      dayOfWeek: selectedDay,
      startTime,
      endTime,
    };

    const response = await createSchedule(scheduleData, token);
    setIsLoading(false);

    if (response.scheduleId) {
      Alert.alert('Sucesso', 'Horário criado com sucesso!');
      navigation.goBack();
    } else {
      Alert.alert('Erro', response.message || 'Não foi possível criar o horário.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Horário</Text>

      {isLoadingStudents ? (
        <ActivityIndicator color="#d4af37" />
      ) : (
        <>
           <Text style={styles.label}>Aluno</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudentId}
              onValueChange={(itemValue: string | null) => setSelectedStudentId(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Selecione um aluno..." value={null} color="#aaa" />
              {students.map((student) => (
                <Picker.Item key={student.id} label={student.name} value={student.id} color="#fff" />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Dia da Semana</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
               {DAYS_OF_WEEK.map((day) => (
                <Picker.Item key={day} label={day} value={day} color="#fff" />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Hora de Início</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#aaa"
            value={startTime}
            onChangeText={setStartTime}
            maxLength={5}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Hora de Fim</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#aaa"
            value={endTime}
            onChangeText={setEndTime}
            maxLength={5}
            keyboardType="numbers-and-punctuation"
          />
        </>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 30, marginTop: 40, textAlign: 'center' },
  label: { fontSize: 18, color: '#fff', marginBottom: 10, alignSelf: 'flex-start' },
  input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  pickerContainer: { width: '100%', backgroundColor: '#333', borderRadius: 10, marginBottom: 20 },
  picker: { color: '#fff', height: 60 },
  button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
  backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
});