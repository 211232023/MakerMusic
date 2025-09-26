import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserProvider, useUser } from "./src/pages/src/UserContext";

// Telas   
import LoginScreen from "./src/pages/HomeScreen/LoginSreen";
import RegisterScreen from "./src/pages/HomeScreen/RegisterScreen";
import HomeScreen from './src/pages/HomeScreen/HomeScreen'
import TeacherScreen from "./src/pages/TeacherScreen/TeacherScreen";
import TasksScreen from "./src/pages/TeacherScreen/TasksScreen";
import ScheduleScreen from "./src/pages/HomeScreen/HorariosScreen";
import AttendanceScreen from "./src/pages/TeacherScreen/PresençaScreen";
import ChatScreen from "./src/pages/HomeScreen/ChatScreen";
import AdminHomeScreen from "./src/pages/AdminScreen/AdminScreen";
import EntitiesScreen from "./src/pages/HomeScreen/EntitiesScreen";
import FinanceScreen from "./src/pages/HomeScreen/FinanceScreen";
import PaymentsScreen from "./src/pages/HomeScreen/PymentsScreen";
import StudentsScreen from "./src/pages/HomeScreen/StudentsScreen";
import AddScheduleScreen from "./src/pages/HomeScreen/AddScheduleScreen";

export type RootStackParamList = {
  LoginScreen: undefined;
  Register: undefined;
  HomeScreen: undefined;
  TeacherScreen: undefined;
  TasksScreen: undefined;
  ScheduleScreen: { newSchedule?: { id: string; day: string; time: string } };
  AddScheduleScreen: undefined;
  AttendanceScreen: undefined;
  ChatScreen: undefined;
  AdminHomeScreen: undefined;
  EntitiesScreen: undefined;
  FinanceScreen: undefined;
  PaymentsScreen: undefined;
  StudentsScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user } = useUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="TeacherScreen" component={TeacherScreen} />
          <Stack.Screen name="TasksScreen" component={TasksScreen} />
          <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
          <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
          <Stack.Screen name="EntitiesScreen" component={EntitiesScreen} />
          <Stack.Screen name="FinanceScreen" component={FinanceScreen} />
          <Stack.Screen name="PaymentsScreen" component={PaymentsScreen} />
          <Stack.Screen name="StudentsScreen" component={StudentsScreen} />
          <Stack.Screen name="AddScheduleScreen" component={AddScheduleScreen} />
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
