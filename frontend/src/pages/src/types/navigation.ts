import { NavigatorScreenParams } from '@react-navigation/native';
import PaymentsScreen from '../../screens/screens/PaymentsScreen';

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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
