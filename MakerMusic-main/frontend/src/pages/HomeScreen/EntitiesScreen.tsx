import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getAllUsers, deleteUser } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types/navigation';
import { Ionicons } from '@expo/vector-icons';

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
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#f6e27f" />
          <Text style={styles.loadingText}>Carregando utilizadores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainRouter' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonHeader} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="people-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Todos os Utilizadores</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>Nenhum utilizador encontrado</Text>
              <Text style={styles.emptySubtext}>Não existem usuários cadastrados no sistema</Text>
            </View>
          ) : (
            <View style={styles.usersContainer}>
              {users.map((item) => (
                <View key={item.id.toString()} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                        <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDelete(item.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getRoleColor = (role: string) => {
  switch (role.toUpperCase()) {
    case 'ADMIN': return '#f6e27f';
    case 'PROFESSOR': return '#81c784';
    case 'ALUNO': return '#64b5f6';
    case 'FINANCEIRO': return '#ffb74d';
    default: return '#aaa';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f',
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButtonHeader: {
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#f6e27f',
  },
  loadingText: {
    color: '#aaa', 
    marginTop: 15,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  usersContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 15,
  },
  userCard: { 
    backgroundColor: '#2a292e', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  avatarText: {
    color: '#f6e27f',
    fontWeight: 'bold',
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: { 
    color: '#aaa', 
    fontSize: 14,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#a00',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});