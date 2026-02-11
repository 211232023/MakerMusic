import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contextos
import { UserProvider, useUser } from './src/pages/src/UserContext';
import { ToastProvider } from './src/contexts/ToastContext';

// Telas
import LoginScreen from './src/pages/HomeScreen/LoginSreen';
import RegisterScreen from './src/pages/HomeScreen/RegisterScreen';
import ForgotPasswordScreen from './src/pages/HomeScreen/ForgotPasswordScreen';
import ResetPasswordScreen from './src/pages/HomeScreen/ResetPasswordScreen';
import MainScreenRouter from './src/pages/src/MainScreenRouter';

// Telas de funcionalidades
import HorariosScreen from './src/pages/HomeScreen/HorariosScreen';
import PymentsScreen from './src/pages/HomeScreen/PymentsScreen';
import StudentTasksScreen from './src/pages/StudentScreen/StudentTasksScreen';
import ChatScreen from './src/pages/HomeScreen/ChatScreen';
import ManageUsersScreen from './src/pages/AdminScreen/ManageUsersScreen';
import EntitiesScreen from './src/pages/HomeScreen/EntitiesScreen';
import AddScheduleScreen from './src/pages/TeacherScreen/AddScheduleScreen';
import AdminFinanceScreen from './src/pages/FinanceScreen/AdminFinanceScreen';
import AdminRegisterUserScreen from './src/pages/AdminScreen/AdminRegisterUserScreen';
import StudentPerformanceScreen from './src/pages/TeacherScreen/StudentPerformanceScreen';
import TeacherChatListScreen from './src/pages/TeacherScreen/TeacherChatListScreen';
import TeacherPerformanceListScreen from './src/pages/TeacherScreen/TeacherPerformanceListScreen';
import TasksScreen from './src/pages/TeacherScreen/TasksScreen';
import PresencaScreen from './src/pages/TeacherScreen/PresençaScreen';

import { RootStackParamList } from './src/pages/src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null; 
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainRouter" component={MainScreenRouter} />
          <Stack.Screen name="HorariosScreen" component={HorariosScreen} />
          <Stack.Screen name="PymentsScreen" component={PymentsScreen} />
          <Stack.Screen name="StudentTasks" component={StudentTasksScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
          <Stack.Screen name="Entities" component={EntitiesScreen} />
          <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
          <Stack.Screen name="AdminFinance" component={AdminFinanceScreen} />
          <Stack.Screen name="AdminRegisterUser" component={AdminRegisterUserScreen} />
          <Stack.Screen name="StudentPerformance" component={StudentPerformanceScreen} />
          <Stack.Screen name="TeacherChatList" component={TeacherChatListScreen} />
          <Stack.Screen name="TeacherPerformanceList" component={TeacherPerformanceListScreen} />
          <Stack.Screen name="TasksScreen" component={TasksScreen} />
          <Stack.Screen name="PresençaScreen" component={PresencaScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <UserProvider>
          <NavigationContainer>
            <Navigation />
            <StatusBar style="light" />
          </NavigationContainer>
        </UserProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}