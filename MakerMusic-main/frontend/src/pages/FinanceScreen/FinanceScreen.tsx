import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';

type FinanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Styles {
  scrollContainer: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  userName: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
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
    justifyContent: 'center', // Centraliza verticalmente o conteúdo
    padding: 20,
    paddingTop: 60,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 10,
    textAlign: 'center',
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    alignSelf: 'center',
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
    maxWidth: 600,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    marginTop: 20,
    marginBottom: 20,
    borderColor: '#a00',
  },
});

export default function FinanceScreen() {
  const navigation = useNavigation<FinanceScreenNavigationProp>();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={styles.title}>Painel do Financeiro</Text>
          <Text style={styles.userName}>Seja bem-vindo(a), {user?.name}</Text>
        </View>

        <View style={{ flex: 1 }} /> {/* Espaçador superior para centralizar o card */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operações Financeiras</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('AdminFinance')}
          >
            <Text style={styles.buttonText}>Lançar Mensalidade</Text>
          </TouchableOpacity>
        </View>

        {/* Espaçador flexível para empurrar o botão de sair para o final da tela */}
        <View style={{ flex: 1, minHeight: 100 }} />

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}