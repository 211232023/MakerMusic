import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../src/UserContext';
import { getAllUsers, assignTeacherToStudent } from '../../services/api';

// Definimos o tipo User aqui para incluir teacher_id
type User = {
  id: string;
  name: string;
  email: string;
  role: 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'FINANCEIRO';
  teacher_id?: number | null;
};

export default function ManageUsersScreen() {
  const { token } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  // --- MUDANÇA 1: Usar string vazia em vez de null ---
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  const fetchUsers = async () => {
    if (token) {
      const allUsers = await getAllUsers(token);
      if (Array.isArray(allUsers)) {
        setUsers(allUsers);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAssignModal = (student: User) => {
    setSelectedStudent(student);
    // --- MUDANÇA 2: Resetar para string vazia ---
    setSelectedTeacher(""); 
    setModalVisible(true);
  };

  const handleAssignTeacher = async () => {
    // A verificação !selectedTeacher continua a funcionar com a string vazia
    if (!selectedStudent || !selectedTeacher || !token) {
      Alert.alert('Erro', 'Selecione um aluno e um professor.');
      return;
    }

    const response = await assignTeacherToStudent(selectedStudent.id, selectedTeacher, token);
    
    if (response.message === 'Professor vinculado ao aluno com sucesso!') {
      Alert.alert('Sucesso', response.message);
      fetchUsers();
      setModalVisible(false);
    } else {
      Alert.alert('Erro', response.message || 'Não foi possível vincular o professor.');
    }
  };

  const teachers = users.filter(u => u.role === 'PROFESSOR');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerir Utilizadores</Text>
      <FlatList
        data={users.filter(u => u.role === 'ALUNO')}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <TouchableOpacity style={styles.button} onPress={() => openAssignModal(item)}>
              <Text style={styles.buttonText}>Vincular Professor</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Vincular Professor a</Text>
            <Text style={styles.modalStudentName}>{selectedStudent?.name}</Text>
            
            <Picker
              selectedValue={selectedTeacher}
              style={styles.picker}
              onValueChange={(itemValue: string) => setSelectedTeacher(itemValue)}
            >
              {/* --- MUDANÇA 3: Usar string vazia como valor do item "placeholder" --- */}
              <Picker.Item label="Selecione um professor..." value="" />
              {teachers.map((teacher) => (
                <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
              ))}
            </Picker>

            <Button title="Salvar Vinculação" onPress={handleAssignTeacher} color="#d4af37" />
            <View style={{ marginTop: 10 }}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="grey" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#f6e27f', marginBottom: 20, textAlign: 'center' },
    userItem: { backgroundColor: '#333', padding: 15, borderRadius: 10, marginBottom: 10 },
    userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    userEmail: { color: '#ccc', fontSize: 14 },
    button: { backgroundColor: '#d4af37', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
    buttonText: { color: '#1c1b1f', fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '80%', backgroundColor: '#333', borderRadius: 20, padding: 35, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    modalStudentName: { fontSize: 18, color: '#f6e27f', marginBottom: 15 },
    picker: { width: '100%', height: 150, color: '#fff', backgroundColor: '#444', marginBottom: 20 },
});