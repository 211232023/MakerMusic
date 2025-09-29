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
  TasksScreen: undefined; // Tela do professor para gerir tarefas
  PresençaScreen: undefined; // Tela de presença do professor
  ManageUsers: undefined; // Tela do admin para gerir utilizadores
  Entities: undefined; // Tela do admin para ver entidades

  // Telas de Chat
  Chat: { otherUserId: string; otherUserName: string; };
  TeacherChatList: undefined;
};