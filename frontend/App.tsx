import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './src/pages/src/UserContext';
import LoginScreen from './src/pages/HomeScreen/LoginSreen';
import RegisterScreen from './src/pages/HomeScreen/RegisterScreen';
import HomeScreen from './src/pages/HomeScreen/HomeScreen';
import AdminScreen from './src/pages/AdminScreen/AdminScreen'; // Garanta que o nome do ficheiro está correto
import TeacherScreen from './src/pages/TeacherScreen/TeacherScreen';
import { RootStackParamList } from './src/pages/src/types/navigation';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// O nome da sua tela de Admin no navigation.ts é 'AdminHomeScreen'
// mas o componente que você quer mostrar é o 'AdminScreen'.
// Vamos importar o AdminScreen e dar-lhe o nome correto na navegação.
import AdminHomeScreenComponent from './src/pages/AdminScreen/AdminScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user } = useUser();

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
          // Se o utilizador estiver logado, decide para onde o enviar
          <>
            {/* CORREÇÃO: Usando o nome 'AdminHomeScreen' como definido no seu navigation.ts */}
            {user.role.toUpperCase() === 'ADMIN' && (
              <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreenComponent} />
            )}
            {/* CORREÇÃO: Usando o nome 'TeacherScreen' */}
            {user.role.toUpperCase() === 'PROFESSOR' && (
              <Stack.Screen name="TeacherScreen" component={TeacherScreen} />
            )}
            {/* CORREÇÃO: Usando o nome 'HomeScreen' */}
            {(user.role.toUpperCase() === 'ALUNO' || user.role.toUpperCase() === 'FINANCEIRO') && (
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
            )}
          </>
        ) : (
          // Se não estiver logado, mostra as telas de autenticação
          <>
            {/* CORREÇÃO: Usando o nome 'LoginScreen' */}
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            {/* O nome 'Register' já estava correto no seu navigation.ts */}
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