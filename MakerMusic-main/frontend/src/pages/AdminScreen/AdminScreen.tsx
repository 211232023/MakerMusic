import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';

type AdminScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminScreen() {
  const navigation = useNavigation<AdminScreenNavigationProp>();
  const { user, logout } = useUser();

    const handleLogout = () => {
    console.log("LOGOUT: Botão 'Sair' clicado. Chamando logout diretamente.");
    logout(); // Chama a função de logout diretamente
  };                                                                                                                                                                         

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Administrador</Text>
      <Text style={styles.userName}>Bem-vindo, {user?.name}</Text>

      {/* --- CORREÇÃO 1: Nome da rota e remoção de parâmetro --- */}
	      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminRegisterUser')}>
	        <Text style={styles.buttonText}>Cadastrar Novo Usuário</Text>
	      </TouchableOpacity>

	      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Entities')}>
	        <Text style={styles.buttonText}>Ver Utilizadores</Text>
	      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminFinance')}>
        <Text style={styles.buttonText}>Gerir Financeiro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageUsers')}>
        <Text style={styles.buttonText}>Vincular Aluno/Professor</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
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
  logoutButton: {
    backgroundColor: '#8B0000',
    marginTop: 20,
  },
});