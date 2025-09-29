import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './src/pages/src/UserContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Importe os tipos do ficheiro central
import { RootStackParamList } from './src/pages/src/types/navigation';

// Importe todas as suas telas
import LoginScreen from "./src/pages/HomeScreen/LoginSreen";
import RegisterScreen from "./src/pages/HomeScreen/RegisterScreen";
import HomeScreen from './src/pages/HomeScreen/HomeScreen';
import TeacherScreen from "./src/pages/TeacherScreen/TeacherScreen";
import AdminScreen from "./src/pages/AdminScreen/AdminScreen";
import HorariosScreen from './src/pages/HomeScreen/HorariosScreen';
import ChatScreen from './src/pages/HomeScreen/ChatScreen';
import PymentsScreen from './src/pages/HomeScreen/PymentsScreen';
import TasksScreen from './src/pages/HomeScreen/TasksScreen';
import PresencaScreen from './src/pages/TeacherScreen/PresençaScreen';
import EntitiesScreen from './src/pages/HomeScreen/EntitiesScreen';
import ManageUsersScreen from './src/pages/AdminScreen/ManageUsersScreen';
import StudentTasksScreen from "./src/pages/StudentScreen/StudentTasksScreen";
import TeacherChatListScreen from "./src/pages/TeacherScreen/TeacherChatListScreen";

// Use os tipos importados para criar o navegador
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Telas Iniciais */}
          {user.role === 'ALUNO' && <Stack.Screen name="HomeScreen" component={HomeScreen} />}
          {user.role === 'PROFESSOR' && <Stack.Screen name="TeacherScreen" component={TeacherScreen} />}
          {user.role === 'ADMIN' && <Stack.Screen name="AdminScreen" component={AdminScreen} />}

          {/* Telas Secundárias */}
          <Stack.Screen name="ManageUsersScreen" component={ManageUsersScreen} />
          <Stack.Screen name="HorariosScreen" component={HorariosScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="PymentsScreen" component={PymentsScreen} />
          <Stack.Screen name="TasksScreen" component={TasksScreen} />
          <Stack.Screen name="PresencaScreen" component={PresencaScreen} />
          <Stack.Screen name="EntitiesScreen" component={EntitiesScreen} />
          <Stack.Screen name="StudentTasks" component={StudentTasksScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TeacherChatList" component={TeacherChatListScreen} options={{ headerShown: false }} />
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
  },
});