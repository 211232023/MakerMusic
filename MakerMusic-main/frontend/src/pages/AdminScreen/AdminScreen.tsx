import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';

interface Styles {
  scrollContainer: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  userName: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  viewButtonsContainer: ViewStyle;
  viewButton: ViewStyle;
  viewButtonText: TextStyle;
  logoutButton: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1c1b1f',
  },
  container: {
    flex: 1,
    backgroundColor: '#1c1b1f',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
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
    marginBottom: 30,
  },
  section: {
    width: '100%',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
  },
  sectionTitle: {
    color: '#f6e27f',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  viewButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    width: '31%', // Ajustado para caber 3 na mesma linha
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16, // Fonte reduzida para não quebrar o texto
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    marginTop: 10,
    borderColor: '#a00',
  },
});

type AdminScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminScreen() {
  const navigation = useNavigation<AdminScreenNavigationProp>();
  const { user, logout, setViewRole } = useUser();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Painel do Administrador</Text>
        <Text style={styles.userName}>Bem-vindo, {user?.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciamento</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminRegisterUser')}>
            <Text style={styles.buttonText}>Cadastrar Novo Usuário</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Entities')}>
            <Text style={styles.buttonText}>Ver Utilizadores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageUsers')}>
            <Text style={styles.buttonText}>Vincular Aluno/Professor</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternar Visão (Modo Admin)</Text>
          <View style={styles.viewButtonsContainer}>
            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: '#4a90e2' }]} 
              onPress={() => setViewRole('ALUNO')}
            >
              <Text style={styles.viewButtonText}>Visão Aluno</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: '#50e3c2' }]} 
              onPress={() => setViewRole('PROFESSOR')}
            >
              <Text style={styles.viewButtonText}>Visão Professor</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: '#f5a623' }]} 
              onPress={() => setViewRole('FINANCEIRO')}
            >
              <Text style={styles.viewButtonText}>Visão Financeiro</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
