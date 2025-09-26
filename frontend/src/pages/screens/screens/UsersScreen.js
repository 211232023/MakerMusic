import React, { useState, useEffect } from 'react'; 
import { View, TextInput, FlatList, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserItem from '../components/UserItem'; // Confirme o caminho
import { Picker } from '@react-native-picker/picker';

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Aluno');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadUsers();
    const unsubscribe = navigation.addListener('focus', loadUsers);
    return unsubscribe;
  }, [navigation]);

  const loadUsers = async () => {
    try {
      const data = await AsyncStorage.getItem('@users');
      if (data) setUsers(JSON.parse(data));
    } catch (e) {
      console.log('Erro ao carregar usuários:', e);
    }
  };

  const saveUsers = async (newUsers) => {
    try {
      setUsers(newUsers);
      await AsyncStorage.setItem('@users', JSON.stringify(newUsers));
    } catch (e) {
      console.log('Erro ao salvar usuários:', e);
    }
  };

  const addOrEditUser = () => {
    if (!name.trim()) return Alert.alert('Erro', 'Digite o nome do usuário');

    if (editingId) {
      const updated = users.map(u => u.id === editingId ? { ...u, name, role } : u);
      saveUsers(updated);
      setEditingId(null);
    } else {
      const newUser = { id: Date.now().toString(), name, role, paid: false };
      saveUsers([...users, newUser]);
    }

    setName('');
    setRole('Aluno');
  };

  const deleteUser = (id) => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente remover este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => saveUsers(users.filter(u => u.id !== id)) },
      ]
    );
  };

  const editUser = (user) => {
    setName(user.name);
    setRole(user.role);
    setEditingId(user.id);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={setRole}
          style={styles.picker}
        >
          <Picker.Item label="Aluno" value="Aluno" />
          <Picker.Item label="Professor" value="Professor" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addOrEditUser}>
        <Text style={styles.addButtonText}>
          {editingId ? "Salvar Alterações" : "Adicionar Usuário"}
        </Text>
      </TouchableOpacity>

      {users.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              deleteUser={deleteUser}
              editUser={editUser}
            />
          )}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1c1b1f' },
  input: {
    borderWidth: 1,
    borderColor: '#d4af37',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    color: '#e0d9c0',
    backgroundColor: '#2a292c',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#2a292c',
  },
  picker: { height: 50, color: '#e0d9c0' },
  addButton: {
    backgroundColor: '#d4af37',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 16 },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#e0d9c0',
    fontSize: 16,
  },
});
