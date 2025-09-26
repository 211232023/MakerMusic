import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ScheduleScreen'>;

interface Schedule {
  id: string;
  day: string;
  time: string;
}

export default function HorariosScreen({ route, navigation }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
  const { newSchedule } = route.params || {};

  if (newSchedule) {
    setSchedules(prevSchedules => {
      // Evita adicionar o mesmo horário múltiplas vezes
      if (prevSchedules.some(schedule => schedule.id === newSchedule.id)) {
        return prevSchedules;
      }

      return [...prevSchedules, newSchedule];
    });
  }
}, [route.params?.newSchedule]);

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remover Horário',
      'Deseja realmente remover este horário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => setSchedules(prev => prev.filter(item => item.id !== id)) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Horários</Text>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardDay}>{item.day}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
              <Text style={styles.removeButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum horário cadastrado</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddScheduleScreen')}>
        <Text style={styles.addButtonText}>+ Adicionar Horário</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#2b2a2f', padding: 20, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDay: { color: '#f6e27f', fontSize: 18, fontWeight: 'bold' },
  cardTime: { color: '#fff', fontSize: 16, marginTop: 4 },
  removeButton: { backgroundColor: '#ff4d4d', padding: 10, borderRadius: 8 },
  removeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 20 },
  addButton: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 16 },
});
