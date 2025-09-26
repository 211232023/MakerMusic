import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScheduleItem from './ScheduleItem'; // Ajuste o caminho conforme necessário

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState([]);
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await AsyncStorage.getItem('@schedules');
      if (data) setSchedules(JSON.parse(data));
    } catch (e) {
      console.log('Erro ao carregar horários:', e);
    }
  };

  const saveSchedules = async (newSchedules) => {
    try {
      setSchedules(newSchedules);
      await AsyncStorage.setItem('@schedules', JSON.stringify(newSchedules));
    } catch (e) {
      console.log('Erro ao salvar horários:', e);
    }
  };

  const addSchedule = () => {
    if (!subject.trim() || !teacher.trim() || !time.trim()) {
      return Alert.alert('Erro', 'Preencha todos os campos');
    }

    const newSchedule = {
      id: Date.now().toString(),
      subject,
      teacher,
      time,
    };

    saveSchedules([...schedules, newSchedule]);
    setSubject('');
    setTeacher('');
    setTime('');
  };

  const deleteSchedule = (id) => {
    const filtered = schedules.filter((s) => s.id !== id);
    saveSchedules(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Matéria"
        placeholderTextColor="#aaa"
        value={subject}
        onChangeText={setSubject}
        style={styles.input}
      />
      <TextInput
        placeholder="Professor"
        placeholderTextColor="#aaa"
        value={teacher}
        onChangeText={setTeacher}
        style={styles.input}
      />
      <TextInput
        placeholder="Horário"
        placeholderTextColor="#aaa"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />

      <TouchableOpacity style={styles.addButton} onPress={addSchedule}>
        <Text style={styles.addButtonText}>Adicionar Horário</Text>
      </TouchableOpacity>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScheduleItem schedule={item} deleteSchedule={deleteSchedule} />
        )}
        style={{ marginTop: 20 }}
        ListEmptyComponent={
          <View style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: '#aaa' }}>Nenhum horário cadastrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1c1b1f' },
  input: {
    borderWidth: 1,
    borderColor: '#d4af37',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    color: '#e0d9c0',
    backgroundColor: '#2a292c',
  },
  addButton: {
    backgroundColor: '#d4af37',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 16 },
});
