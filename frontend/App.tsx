import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './src/pages/src/UserContext';
import LoginScreen from './src/pages/HomeScreen/LoginSreen';
import RegisterScreen from './src/pages/HomeScreen/RegisterScreen';
import HomeScreen from './src/pages/HomeScreen/HomeScreen';
import TeacherScreen from './src/pages/TeacherScreen/TeacherScreen';
import AdminHomeScreenComponent from './src/pages/AdminScreen/AdminScreen'; // O componente da tela Admin
import { RootStackParamList } from './src/pages/src/types/navigation';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user } = useUser();

  // --- FERRAMENTA DE DIAGNÓSTICO ---
  // Este log irá mostrar no seu terminal do frontend qual utilizador está a ser usado.
  console.log('AppNavigator está a renderizar com o seguinte utilizador:', JSON.stringify(user, null, 2));

  // Mostra uma tela de loading enquanto o user é carregado do AsyncStorage
  if (user === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Se o utilizador estiver logado (user não é nulo)
          <>
            {/* Lógica de navegação baseada no role */}
            {user.role.toUpperCase() === 'ADMIN' && (
              <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreenComponent} />
            )}
            {user.role.toUpperCase() === 'PROFESSOR' && (
              <Stack.Screen name="TeacherScreen" component={TeacherScreen} />
            )}
            {(user.role.toUpperCase() === 'ALUNO' || user.role.toUpperCase() === 'FINANCEIRO') && (
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
            )}
          </>
        ) : (
          // Se não estiver logado (user é nulo), mostra as telas de autenticação
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
  },
});