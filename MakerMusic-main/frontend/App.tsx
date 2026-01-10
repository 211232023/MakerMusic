import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './src/pages/src/UserContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AdminRegisterUserScreen from './src/pages/AdminScreen/AdminRegisterUserScreen';

// Telas de Autenticação
import LoginScreen from './src/pages/HomeScreen/LoginSreen';
import RegisterScreen from './src/pages/HomeScreen/RegisterScreen';
//terceira alteração de recuperação de senha
import ForgotPasswordScreen from './src/pages/HomeScreen/ForgotPasswordScreen';
import ResetPasswordScreen from './src/pages/HomeScreen/ResetPasswordScreen.tsx';

// Telas Principais por Papel
import HomeScreen from './src/pages/HomeScreen/HomeScreen';
import TeacherScreen from './src/pages/TeacherScreen/TeacherScreen';
import AdminScreen from './src/pages/AdminScreen/AdminScreen';
import FinanceScreen from './src/pages/FinanceScreen/FinanceScreen';
import MainScreenRouter from './src/pages/src/MainScreenRouter';

// Telas Específicas
import StudentTasksScreen from './src/pages/StudentScreen/StudentTasksScreen';
import TeacherTasksScreen from './src/pages/TeacherScreen/TasksScreen';
import ChatScreen from './src/pages/HomeScreen/ChatScreen';
import TeacherChatListScreen from './src/pages/TeacherScreen/TeacherChatListScreen';
import ManageUsersScreen from './src/pages/AdminScreen/ManageUsersScreen';
import EntitiesScreen from './src/pages/HomeScreen/EntitiesScreen';
import AddScheduleScreen from "./src/pages/TeacherScreen/AddScheduleScreen";
import AdminFinanceScreen from './src/pages/FinanceScreen/AdminFinanceScreen';

// Telas Comuns
import HorariosScreen from './src/pages/HomeScreen/HorariosScreen';
import PymentsScreen from './src/pages/HomeScreen/PymentsScreen';
import PresencaScreen from './src/pages/TeacherScreen/PresençaScreen'; 

import { RootStackParamList } from './src/pages/src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user } = useUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Tela principal que roteia para o papel correto */}
          <Stack.Screen name="MainRouter" component={MainScreenRouter} />
          
          {/* Telas acessíveis após o login */}
          <Stack.Screen name="StudentTasks" component={StudentTasksScreen} />
          <Stack.Screen name="TasksScreen" component={TeacherTasksScreen} />
          <Stack.Screen name="TeacherChatList" component={TeacherChatListScreen} />
          <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
          <Stack.Screen name="Entities" component={EntitiesScreen} />
          <Stack.Screen name="HorariosScreen" component={HorariosScreen} />
          <Stack.Screen name="PymentsScreen" component={PymentsScreen} />
          <Stack.Screen name="PresençaScreen" component={PresencaScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="AddSchedule" component={AddScheduleScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AdminFinance" component={AdminFinanceScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AdminRegisterUser" component={AdminRegisterUserScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          {/* Alteração da recuperação de senha */}
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /> 
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    </ToastProvider>
  );
}