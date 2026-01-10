import React from 'react';
import { useUser } from './UserContext';
import HomeScreen from '../HomeScreen/HomeScreen';
import TeacherScreen from '../TeacherScreen/TeacherScreen';
import AdminScreen from '../AdminScreen/AdminScreen';
import FinanceScreen from '../FinanceScreen/FinanceScreen';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1b1f' },
  text: { color: '#fff', fontSize: 16 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#d4af37',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  backButtonText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
  }
});

// Componente para exibir uma tela de erro caso o papel do usuário não seja reconhecido
const ErrorScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Erro: Papel de usuário não reconhecido.</Text>
    <Text style={styles.text}>Por favor, entre em contato com o administrador.</Text>
  </View>
);

export default function MainScreenRouter() {
  const { user, viewRole, setViewRole } = useUser();

  if (!user) {
    // Isso não deve acontecer se a navegação estiver correta, mas é uma salvaguarda
    return <ErrorScreen />;
  }

  // Se o usuário for ADMIN e tiver uma viewRole definida, mostramos essa visão
  const effectiveRole = (user.role === 'ADMIN' && viewRole) ? viewRole : user.role;

    const renderScreen = () => {
    switch (effectiveRole) {
      case 'ALUNO': return <HomeScreen />;
      case 'PROFESSOR': return <TeacherScreen />;
      case 'ADMIN': return <AdminScreen />;
      case 'FINANCEIRO': return <FinanceScreen />;
      default: return <ErrorScreen />;
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}