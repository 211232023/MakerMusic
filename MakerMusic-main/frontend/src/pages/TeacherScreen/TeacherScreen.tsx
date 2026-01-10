import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';

type TeacherScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TeacherScreen() {
  const navigation = useNavigation<TeacherScreenNavigationProp>();
  const { user, logout, viewRole } = useUser();

  const handleLogout = () => {
    console.log("LOGOUT: Botão 'Sair' clicado.");
    logout(); // A função logout no UserContext já trata se deve voltar ao admin ou deslogar
  };

  // Permite acesso se o usuário for PROFESSOR ou se for um ADMIN simulando a visão de PROFESSOR
  const hasAccess = user?.role === 'PROFESSOR' || (user?.role === 'ADMIN' && viewRole === 'PROFESSOR');

  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso Negado</Text>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Professor</Text>
      <Text style={styles.userName}>Bem-vindo, {user?.name}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TasksScreen')}>
        <Text style={styles.buttonText}>Gerenciar Tarefas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddSchedule')}>
        <Text style={styles.buttonText}>Criar Horário de Aula</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PresençaScreen')}>
        <Text style={styles.buttonText}>Lista de Presença</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TeacherChatList')}>
        <Text style={styles.buttonText}>Conversar com Alunos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>
          {user?.role === 'ADMIN' && viewRole === 'PROFESSOR' ? "Voltar ao Painel do Admin" : "Sair"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1b1f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 10,
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
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    marginTop: 20, 
  },
});