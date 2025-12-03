import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';

type FinanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FinanceScreen() {
  const navigation = useNavigation<FinanceScreenNavigationProp>();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Financeiro</Text>
      <Text style={styles.userName}>Bem-vindo(a), {user?.name}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminFinance')}>
        <Text style={styles.buttonText}>Lançar Mensalidade</Text>
      </TouchableOpacity>

      {/* Futuras funcionalidades podem ser adicionadas aqui . Atualização*/}

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
