import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
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
    console.log("LOGOUT: Botão 'Sair' clicado.");
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
      <View style={styles.container}>
        <Text style={styles.title}>MakerMusic</Text>
        <Text style={styles.userName}>Olá, {user?.name}</Text>

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
          <Text style={styles.buttonText}>
            {user?.role === 'ADMIN' && viewRole === 'ALUNO' ? "Voltar ao Painel do Admin" : "Sair"}
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 30,
    marginTop: 40
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
  },
});