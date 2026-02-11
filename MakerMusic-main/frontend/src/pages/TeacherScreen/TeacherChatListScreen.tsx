import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { getStudentsByTeacher } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { RootStackParamList } from '../src/types/navigation';
import { Ionicons } from '@expo/vector-icons';

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

  const onChatPress = (student: Student) => {
    navigation.navigate('Chat', { otherUserId: student.id, otherUserName: student.name });
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#f6e27f" />
          <Text style={styles.loadingText}>Carregando alunos...</Text>
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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="chatbubbles-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Iniciar Conversa</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>Nenhum aluno vinculado</Text>
              <Text style={styles.emptySubtext}>Você ainda não possui alunos para conversar</Text>
            </View>
          ) : (
            <View style={styles.studentsContainer}>
              {students.map((item) => (
                <TouchableOpacity 
                  key={item.id.toString()} 
                  style={styles.studentCard}
                  onPress={() => onChatPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.studentInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.studentSubtext}>Toque para conversar</Text>
                    </View>
                  </View>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#ba68c8" />
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    gap: 12,
  },
  studentCard: { 
    backgroundColor: '#2a292e', 
    padding: 18, 
    borderRadius: 15, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentSubtext: {
    color: '#aaa',
    fontSize: 13,
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
});