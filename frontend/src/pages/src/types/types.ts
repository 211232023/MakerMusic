// src/types/navigation.d.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Defina os nomes das rotas e os parâmetros que elas recebem
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined; 
  Home: undefined; // Home que se adapta ao papel do usuário
  Chat: undefined;
  Estudantes: undefined;
  Financeiro: undefined;
  Entidades: undefined;
  Horarios: { newSchedule?: { id: string; day: string; time: string } };
  Pagamento: undefined;
  Tarefas: undefined;
  Presenca: undefined;
  ProfessorHome: undefined;
  AdminHome: undefined;
  EntitiesScreen: undefined;
  FinanceScreen: undefined;
  PaymentsScreen: undefined;
  StudentsScreen: undefined;
  TasksScreen: undefined;
  ScheduleScreen: undefined;
  AttendanceScreen: undefined;
  TeacherScreen: undefined;
  AddScheduleScreen: undefined;
};

// Extensão para o React Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
