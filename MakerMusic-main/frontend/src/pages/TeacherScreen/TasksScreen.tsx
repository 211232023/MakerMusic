import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMyStudents, createTask } from '../../services/api';
import CustomPicker from '../../components/CustomPicker';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen() {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const { showError, showSuccess, showWarning } = useToast();

  const [title, setTitle] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const loadStudents = useCallback(async () => {
    if (token) {
      try {
        setIsLoadingStudents(true);
        const studentList = await getMyStudents(token);
        setStudents(Array.isArray(studentList) ? studentList : []);
      } finally { setIsLoadingStudents(false); }
    }
  }, [token]);

  useFocusEffect(useCallback(() => { loadStudents(); }, [loadStudents]));

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedStudentId) {
      showWarning('Por favor, escreva o título da tarefa e selecione um aluno.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await createTask({ title, studentId: selectedStudentId }, token!);
      if (response.message === 'Tarefa criada com sucesso!') {
        showSuccess('Tarefa atribuída com sucesso!');
        setTitle(''); setSelectedStudentId(null);
      }
    } finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="clipboard-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Atribuir Tarefa</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="create-outline" size={28} color="#64b5f6" />
              <Text style={styles.cardTitle}>Nova Tarefa</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título da Tarefa</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="text-outline" size={20} color="#aaa" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Digite o título da tarefa" 
                  placeholderTextColor="#666" 
                  value={title} 
                  onChangeText={setTitle} 
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Atribuir para o Aluno</Text>
              {isLoadingStudents ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f6e27f" />
                  <Text style={styles.loadingText}>Carregando alunos...</Text>
                </View>
              ) : (
                <View style={styles.pickerWrapper}>
                  <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <CustomPicker 
                    selectedValue={selectedStudentId} 
                    onValueChange={setSelectedStudentId} 
                    items={[
                      { label: 'Selecione um aluno...', value: null }, 
                      ...students.map(s => ({ label: s.name, value: s.id }))
                    ]} 
                  />
                </View>
              )}
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6e27f" />
                <Text style={styles.loadingText}>Criando tarefa...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleCreateTask}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#1c1b1f" />
                <Text style={styles.buttonText}>Criar e Atribuir Tarefa</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#64b5f6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Dica</Text>
              <Text style={styles.infoText}>
                As tarefas atribuídas aparecerão automaticamente para o aluno selecionado.
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600',
    color: '#f6e27f', 
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    color: '#fff', 
    padding: 15, 
    fontSize: 16,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
  },
  button: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18, 
    borderRadius: 12, 
    width: '100%',
    marginTop: 10,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
  infoCard: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#64b5f620',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64b5f6',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 18,
  },
});