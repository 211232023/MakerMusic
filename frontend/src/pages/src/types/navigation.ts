export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  
  // Telas principais dos perfis
  Home: undefined;
  Teacher: undefined;
  Admin: undefined;

  // Telas de funcionalidades
  HorariosScreen: undefined;
  PymentsScreen: undefined;
  StudentTasks: undefined;
  TasksScreen: undefined; 
  PresençaScreen: undefined;
  ManageUsers: undefined; 
  Entities: undefined; 
  AddSchedule: undefined;
  AdminFinance: undefined;

  // Telas de Chat
  Chat: { otherUserId: string; otherUserName: string; };
  TeacherChatList: undefined;
};