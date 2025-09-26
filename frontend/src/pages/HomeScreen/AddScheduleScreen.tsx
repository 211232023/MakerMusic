// src/pages/HomeScreen/AddScheduleScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types/navigation'; // Puxa a tipagem do arquivo central

type Props = NativeStackScreenProps<RootStackParamList, 'AddScheduleScreen'>;

export default function AddScheduleScreen({ navigation }: Props) {
    const [day, setDay] = useState('');
    const [time, setTime] = useState('');

    const handleAddSchedule = () => {
        if (day && time) {
            const newSchedule = {
                id: Math.random().toString(), // Gera um ID único
                day,
                time,
            };
            // Navega de volta para a tela de horários passando o novo objeto como parâmetro
            navigation.navigate('ScheduleScreen', { newSchedule });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adicionar Novo Horário</Text>
            <TextInput
                style={styles.input}
                placeholder="Dia da semana"
                placeholderTextColor="#aaa"
                value={day}
                onChangeText={setDay}
            />
            <TextInput
                style={styles.input}
                placeholder="Horário (ex: 14:00)"
                placeholderTextColor="#aaa"
                value={time}
                onChangeText={setTime}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
                <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1b1f', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#f6e27f', marginBottom: 20, textAlign: 'center' },
    input: { width: '100%', backgroundColor: '#2b2a2f', padding: 15, borderRadius: 10, color: '#fff', marginBottom: 15, fontSize: 16 },
    addButton: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, alignItems: 'center', width: '100%', marginTop: 20 },
    addButtonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 18 },
});