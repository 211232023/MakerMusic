import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './src/pages/src/UserContext';

// Telas de Autenticação
import LoginScreen from './src/pages/HomeScreen/LoginSreen';
import RegisterScreen from './src/pages/HomeScreen/RegisterScreen';

// Telas Principais por Papel
import HomeScreen from './src/pages/HomeScreen/HomeScreen';
import TeacherScreen from './src/pages/TeacherScreen/TeacherScreen';
import AdminScreen from './src/pages/AdminScreen/AdminScreen';

// Telas Específicas
import StudentTasksScreen from './src/pages/StudentScreen/StudentTasksScreen';
import TeacherTasksScreen from './src/pages/TeacherScreen/TasksScreen';
import ChatScreen from './src/pages/HomeScreen/ChatScreen';
import TeacherChatListScreen from './src/pages/TeacherScreen/TeacherChatListScreen';
import ManageUsersScreen from './src/pages/AdminScreen/ManageUsersScreen';
import EntitiesScreen from './src/pages/HomeScreen/EntitiesScreen';

// Telas Comuns
import HorariosScreen from './src/pages/HomeScreen/HorariosScreen';
import PymentsScreen from './src/pages/HomeScreen/PymentsScreen';
// --- CORREÇÃO AQUI: Importar com o nome de ficheiro correto ---
import PresencaScreen from './src/pages/TeacherScreen/PresençaScreen'; 

import { RootStackParamList } from './src/pages/src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user } = useUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Telas Iniciais de cada papel */}
          {user.role === 'ALUNO' && <Stack.Screen name="Home" component={HomeScreen} />}
          {user.role === 'PROFESSOR' && <Stack.Screen name="Teacher" component={TeacherScreen} />}
          {user.role === 'ADMIN' && <Stack.Screen name="Admin" component={AdminScreen} />}
          
          {/* Telas acessíveis após o login */}
          <Stack.Screen name="StudentTasks" component={StudentTasksScreen} />
          <Stack.Screen name="TasksScreen" component={TeacherTasksScreen} />
          <Stack.Screen name="TeacherChatList" component={TeacherChatListScreen} />
          <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
          <Stack.Screen name="Entities" component={EntitiesScreen} />
          <Stack.Screen name="HorariosScreen" component={HorariosScreen} />
          <Stack.Screen name="PymentsScreen" component={PymentsScreen} />
          {/* --- CORREÇÃO AQUI: Usar o nome de rota definido no navigation.ts --- */}
          <Stack.Screen name="PresençaScreen" component={PresencaScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}