import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllUsers, assignTeacherToStudent } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function ManageUsersScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const fetchUsers = async () => {
    if (token) {
      const allUsers = await getAllUsers(token);
      if (Array.isArray(allUsers)) {
        setUsers(allUsers);
      }
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAssignModal = (student: any) => {
    setSelectedStudent(student);
    setSelectedTeacher('');
    setModalVisible(true);
  };

  const handleAssignTeacher = async () => {
    if (!selectedStudent || !selectedTeacher || !token) {
      showError('Selecione um aluno e um professor.');
      return;
    }
    const response = await assignTeacherToStudent(selectedStudent.id, selectedTeacher, token);
    if (response.message === 'Professor vinculado ao aluno com sucesso!') {
      showSuccess(response.message);
      fetchUsers();
      setModalVisible(false);
    } else {
      showError(response.message || 'Não foi possível vincular o professor.');
    }
  };

  const teachers = users.filter(u => u.role === 'PROFESSOR');
  const teacherItems = teachers.map(teacher => ({ label: teacher.name, value: teacher.id }));

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

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Vincular Professor a</Text>
            <Text style={styles.modalStudentName}>{selectedStudent?.name}</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedTeacher(value)}
              items={teacherItems}
              style={pickerSelectStyles}
              placeholder={{ label: 'Selecione um professor...', value: null }}
              value={selectedTeacher}
            />
            <Button title="Salvar Vinculação" onPress={handleAssignTeacher} color="#d4af37" />
            <View style={{ marginTop: 10 }}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="grey" />
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20, width: '100%' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 30, marginTop: 40, textAlign: 'center' },
  userItem: { 
    backgroundColor: '#333', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center'
  },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: '#ccc', fontSize: 14 },
  button: { backgroundColor: '#d4af37', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#1c1b1f', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '80%', maxWidth: 500, backgroundColor: '#333', borderRadius: 20, padding: 35, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  modalStudentName: { fontSize: 18, color: '#f6e27f', marginBottom: 15 },
  backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 4, color: 'white', paddingRight: 30, backgroundColor: '#444', marginBottom: 20, width: 250 },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: 'purple', borderRadius: 8, color: 'white', paddingRight: 30, backgroundColor: '#444', marginBottom: 20, width: 250 }
});
