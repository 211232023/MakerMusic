import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllUsers, deleteUser } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types/navigation';

type UserFromApi = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function EntitiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useUser();
  const { showError, showSuccess } = useToast(); 
  
  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await getAllUsers(token);
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      showError("Não foi possível carregar a lista de utilizadores.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleDelete = (userId: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir este utilizador? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: async () => {
            if (!token) return;
            const response = await deleteUser(userId, token);
            if (response.message === 'Usuário apagado com sucesso.') {
              showSuccess(response.message);
              fetchUsers(); 
            } else {
              showError(response.message || "Não foi possível excluir o utilizador.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>A carregar utilizadores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todos os Utilizadores</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userRole}>{item.role}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum utilizador encontrado no sistema.</Text>
        }
      />
       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1b1f',
    padding: 20,
    width: '100%',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 30,
    marginTop: 40,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#f6e27f',
  },
  userItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: '#ccc', fontSize: 14 },
  userRole: { color: '#d4af37', fontSize: 12, textTransform: 'uppercase', marginTop: 4 },
  deleteButton: { backgroundColor: '#8B0000', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 50 },
  backButton: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  backButtonText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
});
