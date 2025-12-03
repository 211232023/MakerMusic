import React from 'react';
import { useUser } from './UserContext';
import HomeScreen from '../HomeScreen/HomeScreen';
import TeacherScreen from '../TeacherScreen/TeacherScreen';
import AdminScreen from '../AdminScreen/AdminScreen';
import FinanceScreen from '../FinanceScreen/FinanceScreen';
import { View, Text, StyleSheet } from 'react-native';

// Componente para exibir uma tela de erro caso o papel do usuário não seja reconhecido
const ErrorScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Erro: Papel de usuário não reconhecido.</Text>
    <Text style={styles.text}>Por favor, entre em contato com o administrador.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1b1f' },
  text: { color: '#fff', fontSize: 16 },
});

export default function MainScreenRouter() {
  const { user } = useUser();

  if (!user) {
    // Isso não deve acontecer se a navegação estiver correta, mas é uma salvaguarda
    return <ErrorScreen />;
  }

  switch (user.role) {
    case 'ALUNO':
      return <HomeScreen />;
    case 'PROFESSOR':
      return <TeacherScreen />;
    case 'ADMIN':
      return <AdminScreen />;
    case 'FINANCEIRO':
      return <FinanceScreen />;
    default:
      return <ErrorScreen />;
  }
}