import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation'; 

type AdminScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminScreen() {
  const navigation = useNavigation<AdminScreenNavigationProp>();
  const { logout } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Administrador</Text>
      
      {/* Botão para a gestão geral (CRUD) de utilizadores */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('EntitiesScreen', { entity: 'users' })}
      >
        <Text style={styles.buttonText}>Gerenciar Usuários (CRUD)</Text>
      </TouchableOpacity>

      {/* --- NOVO BOTÃO --- */}
      {/* Botão específico para associar alunos a professores */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('ManageUsersScreen')}
      >
        <Text style={styles.buttonText}>Associar Aluno-Professor</Text>
      </TouchableOpacity>
      
      {/* ... (Pode adicionar outros botões de gestão aqui) ... */}

      <TouchableOpacity 
        style={[styles.button, {backgroundColor: '#8B0000', marginTop: 40}]} 
        onPress={logout}
      >
          <Text style={styles.buttonText}>Sair</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f6e27f',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});