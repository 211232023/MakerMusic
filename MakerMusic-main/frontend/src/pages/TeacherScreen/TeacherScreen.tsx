import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';

export default function TeacherScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, viewRole } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Painel do Professor</Text>
        <Text style={styles.userName}>Bem-vindo, {user?.name}</Text>

        <View style={styles.buttonContainer}>
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
          
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4a4a4a' }]} onPress={() => navigation.navigate('TeacherPerformanceList')}>
            <Text style={styles.buttonText}>Desempenho dos Alunos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>
              {user?.role === 'ADMIN' && viewRole === 'PROFESSOR' ? "Voltar ao Painel do Admin" : "Sair"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f', 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 10,
    textAlign: 'center'
  },
  userName: { 
    fontSize: 18, 
    color: '#fff', 
    marginBottom: 40,
    textAlign: 'center'
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 600,
  },
  button: { 
    backgroundColor: '#333', 
    padding: 20, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1,
    borderColor: '#444'
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  logoutButton: { 
    backgroundColor: '#8B0000', 
    marginTop: 20,
    borderColor: '#a00'
  }
});