import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, SafeAreaView, ScrollView, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllUsers, assignTeacherToStudent } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

export default function ManageUsersScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchUsers = async () => {
    if (token) {
      setIsLoading(true);
      try {
        const allUsers = await getAllUsers(token);
        if (Array.isArray(allUsers)) {
          setUsers(allUsers);
        }
      } finally {
        setIsLoading(false);
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
    setIsAssigning(true);
    try {
      const response = await assignTeacherToStudent(selectedStudent.id, selectedTeacher, token);
      if (response.message === 'Professor vinculado ao aluno com sucesso!') {
        showSuccess(response.message);
        fetchUsers();
        setModalVisible(false);
      } else {
        showError(response.message || 'Não foi possível vincular o professor.');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Se não houver histórico (ex: abriu direto na tela), volta para a tela principal do admin
      navigation.navigate('MainRouter' as any);
    }
  };

  const teachers = users.filter(u => u.role === 'PROFESSOR');
  const teacherItems = teachers.map(teacher => ({ label: teacher.name, value: teacher.id }));
  const students = users.filter(u => u.role === 'ALUNO');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#f6e27f" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="link-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Gerir Utilizadores</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>Nenhum aluno cadastrado</Text>
              <Text style={styles.emptySubtext}>Cadastre alunos para vincular professores</Text>
            </View>
          ) : (
            <View style={styles.studentsContainer}>
              {students.map((item) => (
                <View key={item.id.toString()} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.studentEmail}>{item.email}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.linkButton} 
                    onPress={() => openAssignModal(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="link-outline" size={20} color="#1c1b1f" />
                    <Text style={styles.linkButtonText}>Vincular Professor</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Modal 
          animationType="fade" 
          transparent={true} 
          visible={modalVisible} 
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Ionicons name="link-outline" size={32} color="#f6e27f" />
                <Text style={styles.modalTitle}>Vincular Professor</Text>
              </View>
              
              <View style={styles.modalStudentInfo}>
                <Text style={styles.modalLabel}>Aluno selecionado:</Text>
                <Text style={styles.modalStudentName}>{selectedStudent?.name}</Text>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.modalLabel}>Selecione o professor:</Text>
                <RNPickerSelect
                  onValueChange={(value) => setSelectedTeacher(value)}
                  items={teacherItems}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Selecione um professor...', value: null }}
                  value={selectedTeacher}
                  Icon={() => <Ionicons name="chevron-down" size={24} color="#aaa" />}
                />
              </View>

              {isAssigning ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f6e27f" />
                  <Text style={styles.loadingText}>Vinculando...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.confirmButton} 
                    onPress={handleAssignTeacher}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle-outline" size={22} color="#1c1b1f" />
                    <Text style={styles.confirmButtonText}>Salvar Vinculação</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f',
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#f6e27f',
  },
  loadingText: {
    color: '#aaa', 
    marginTop: 15,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  studentsContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 15,
  },
  studentCard: { 
    backgroundColor: '#2a292e', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 15,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f6e27f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
    fontSize: 20,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentEmail: { 
    color: '#aaa', 
    fontSize: 14,
  },
  linkButton: {
    backgroundColor: '#f6e27f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  linkButtonText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 20,
  },
  modalView: { 
    width: '100%', 
    maxWidth: 450, 
    backgroundColor: '#2a292e', 
    borderRadius: 20, 
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#f6e27f',
  },
  modalStudentInfo: {
    backgroundColor: '#1c1b1f',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalLabel: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
  },
  modalStudentName: { 
    fontSize: 18, 
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  confirmButton: {
    backgroundColor: '#f6e27f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#e57373',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { 
    fontSize: 16, 
    paddingVertical: 14, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    borderColor: '#444', 
    borderRadius: 12, 
    color: '#fff', 
    paddingRight: 40, 
    backgroundColor: '#1c1b1f',
  },
  inputAndroid: { 
    fontSize: 16, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: '#444', 
    borderRadius: 12, 
    color: '#fff', 
    paddingRight: 40, 
    backgroundColor: '#1c1b1f',
  },
  inputWeb: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    color: '#fff',
    backgroundColor: '#1c1b1f',
  },
  iconContainer: {
    top: 14,
    right: 15,
  },
});