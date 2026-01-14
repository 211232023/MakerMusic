import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';
import { getMyTeacher } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout, token, viewRole } = useUser();
  const { showError, showWarning } = useToast(); 

  const handleLogout = () => {
    logout();
  };

  const handleStudentChat = async () => {
    if (token) {
      try {
        const teacher = await getMyTeacher(token);
        if (teacher && teacher.id) {
          navigation.navigate('Chat', { otherUserId: teacher.id.toString(), otherUserName: teacher.name });
        } else {
          showWarning('Você ainda não foi vinculado a um professor.');
        }
      } catch (error) {
        console.error("Erro ao buscar professor:", error);
        showError('Não foi possível obter os dados do seu professor.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContainer}>
          <Text style={styles.title}>MakerMusic</Text>
          <Text style={styles.userName}>Olá, {user?.name}</Text>

          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HorariosScreen', {})}>
              <Text style={styles.buttonText}>Meus Horários</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentTasks')}>
              <Text style={styles.buttonText}>Minhas Tarefas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleStudentChat}>
              <Text style={styles.buttonText}>Chat com Professor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PymentsScreen')}>
              <Text style={styles.buttonText}>Financeiro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>
                {user?.role === 'ADMIN' && viewRole === 'ALUNO' ? "Voltar ao Painel do Admin" : "Sair"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 600, // Largura máxima para o painel
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 10,
    textAlign: 'center',
  },
  userName: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 40,
    opacity: 0.8,
  },
  buttonGrid: {
    width: '100%',
  },
  button: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});