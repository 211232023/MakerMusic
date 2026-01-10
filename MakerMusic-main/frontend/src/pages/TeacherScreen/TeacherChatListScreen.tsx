import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { getStudentsByTeacher } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { RootStackParamList } from '../src/types/navigation';

type Student = { id: string; name: string; };
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TeacherChatListScreen() {
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

  const onStudentPress = (student: Student) => {
    navigation.navigate('Chat', { otherUserId: student.id, otherUserName: student.name });
  };
  
  if (isLoading) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#d4af37" />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Conversa</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.studentItem} onPress={() => onStudentPress(item)}>
            <Text style={styles.studentName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno vinculado a você.</Text>}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#1c1b1f', 
      paddingTop: 60, 
      paddingHorizontal: 20 
    },
    title: { 
      fontSize: 28, 
      fontWeight: 'bold', 
      color: '#f6e27f', 
      marginBottom: 30, 
      textAlign: 'center' 
    },
    studentItem: { 
      backgroundColor: '#333', 
      padding: 20, 
      borderRadius: 10, 
      marginBottom: 10 
    },
    studentName: { 
      color: '#fff', 
      fontSize: 18 
    },
    emptyText: { 
      color: '#aaa', 
      textAlign: 'center', 
      marginTop: 50, 
      fontStyle: 'italic' 
    },
    backButton: { 
      position: 'absolute', 
      bottom: 50, 
      alignSelf: 'center' 
    },
    backButtonText: { 
      color: '#d4af37', 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
});