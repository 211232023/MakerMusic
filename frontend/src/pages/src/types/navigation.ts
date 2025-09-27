import { NavigatorScreenParams } from '@react-navigation/native';
import PaymentsScreen from '../../screens/screens/PaymentsScreen';

export type RootStackParamList = {
  // Telas de Autenticação
  Login: undefined;
  Register: undefined;
  
  // Telas Principais por Perfil
  HomeScreen: undefined;
  TeacherScreen: undefined;
  AdminScreen: undefined;
  
  // Telas Secundárias
  ManageUsersScreen: undefined;
  HorariosScreen: undefined;
  ChatScreen: undefined;
  PymentsScreen: undefined;
  TasksScreen: undefined;
  PresencaScreen: undefined;
  EntitiesScreen: { entity: 'users' | 'schedules' | 'payments' };
  AssignTeacherScreen: undefined; 
  
  // Adicione qualquer outra tela aqui
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
