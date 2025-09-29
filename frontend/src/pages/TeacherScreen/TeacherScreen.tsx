import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';

type Props = {
  navigation: any;
};

export default function TeacherScreen({ navigation }: Props) {
  const { user, logout } = useUser();

  // A CORREÇÃO ESTÁ AQUI: comparar com 'PROFESSOR' em vez de 'Professor'
  if (user?.role !== 'PROFESSOR') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso Negado</Text>
        <Text style={styles.errorSubtitle}>Você não tem permissão para visualizar esta tela.</Text>
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
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PresencaScreen')}>
        <Text style={styles.buttonText}>Lista de Presença</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TeacherChatList')}>
        <Text style={styles.buttonText}>Conversar com Alunos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, {backgroundColor: '#8B0000'}]} onPress={logout}>
          <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... (os seus estilos permanecem iguais)
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
        color: '#FF6347', // Tomato red
        textAlign: 'center',
    },
    errorSubtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
});