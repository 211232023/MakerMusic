import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { getStudentsByTeacher } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { RootStackParamList } from '../src/types/navigation';

type Student = { id: string; name: string; };
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TeacherPerformanceListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, token } = useUser();
  const { showError } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    if (user && token) {
      setIsLoading(true);
      try {
        const data = await getStudentsByTeacher(user.id, token);
        if (Array.isArray(data)) {
          setStudents(data);
        }
      } catch (error) {
        showError("Não foi possível carregar os seus alunos.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, token]);

  useFocusEffect(useCallback(() => { fetchStudents(); }, [fetchStudents]));

  const onPerformancePress = (student: Student) => {
    navigation.navigate('StudentPerformance', { studentId: student.id, studentName: student.name });
  };
  
  if (isLoading) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#d4af37" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Desempenho dos Alunos</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <View style={styles.studentInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.studentName}>{item.name}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => onPerformancePress(item)}>
                <Text style={styles.actionButtonText}>Ver Desempenho</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno vinculado a você.</Text>}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#1c1b1f', 
    },
    title: { 
      fontSize: 28, 
      fontWeight: 'bold', 
      color: '#f6e27f', 
      marginBottom: 30, 
      marginTop: 40,
      textAlign: 'center' 
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center'
    },
    studentItem: { 
      backgroundColor: '#2a292e', 
      padding: 15, 
      borderRadius: 12, 
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#333',
      width: '100%',
    },
    studentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#444',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    avatarText: {
      color: '#f6e27f',
      fontWeight: 'bold',
      fontSize: 18
    },
    studentName: { 
      color: '#fff', 
      fontSize: 17,
      fontWeight: '500'
    },
    actionButtons: {
      flexDirection: 'row',
    },
    actionButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginLeft: 8,
    },
    actionButtonText: {
      color: '#1c1b1f',
      fontWeight: 'bold',
      fontSize: 13,
    },
    emptyText: { 
      color: '#aaa', 
      textAlign: 'center', 
      marginTop: 50, 
      fontStyle: 'italic' 
    },
    backButton: { 
      position: 'absolute', 
      bottom: 40, 
      alignSelf: 'center'
    },
    backButtonText: { 
      color: '#d4af37', 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
});