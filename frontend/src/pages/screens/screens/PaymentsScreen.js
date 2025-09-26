import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../src/UserContext'; // Ajuste para o caminho correto do seu UserContext

export default function PaymentsScreen() {
  const { user } = useContext(UserContext);
  const userRole = user?.role; // Pega o role do usuário logado
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUsers();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUsers = async () => {
    try {
      const data = await AsyncStorage.getItem('@users');
      if (data) {
        const parsed = JSON.parse(data);
        setUsers(parsed);
      }
    } catch (e) {
      console.log('Erro ao carregar usuários:', e);
    }
  };

  const togglePaid = async (id) => {
    if (userRole !== 'Financeiro' && userRole !== 'Admin') {
      Alert.alert('Atenção', 'Você não tem permissão para alterar pagamentos.');
      return;
    }

    const updated = users.map(u => 
      u.id === id ? { ...u, paid: !u.paid } : u
    );

    setUsers(updated);
    await AsyncStorage.setItem('@users', JSON.stringify(updated));
  };

  const alunos = users.filter(u => u.role?.toLowerCase() === 'aluno');

  return (
    <View style={styles.container}>
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>
              {item.name} - {item.paid ? 'Pago' : 'Não Pago'}
            </Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => togglePaid(item.id)}
            >
              <Text style={styles.buttonText}>Alterar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.text, { textAlign: 'center', marginTop: 20 }]}>
            Nenhum aluno cadastrado
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1c1b1f',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 6,
    backgroundColor: '#2a292c',
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#e0d9c0',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
  },
});
