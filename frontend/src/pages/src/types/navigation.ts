export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };

  // Telas principais dos perfis
  Home: undefined;
  Teacher: undefined;
  Admin: undefined;

  // Telas de funcionalidades
  HorariosScreen: { newSchedule?: { id: string; day: string; time: string } };
  PymentsScreen: undefined;
  StudentTasks: undefined;
  TasksScreen: undefined;
  PresençaScreen: undefined;
  ManageUsers: undefined;
  Entities: undefined;
  AddSchedule: undefined;
  AdminFinance: undefined;
  AddScheduleScreen:undefined;

  AdminRegisterUser: undefined;
  // Telas de Chat
  Chat: { otherUserId: string; otherUserName: string; };
  TeacherChatList: undefined;
};