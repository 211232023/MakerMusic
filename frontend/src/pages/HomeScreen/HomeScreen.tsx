import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types/navigation';
import { useUser } from '../src/UserContext'; 

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

export default function HomeScreen({ navigation}: Props) {
  const { user } = useUser();
  const userRole = user?.role;
  
  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MakerMusic</Text>

      {userRole === 'Admin' && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('EntitiesScreen')}>
            <Text style={styles.buttonText}>Gerenciar Usuários</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('ScheduleScreen')}>
            <Text style={styles.buttonText}>Gerenciar Horários</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('FinanceScreen')}>
            <Text style={styles.buttonText}>Controle de Pagamentos</Text>
          </TouchableOpacity>
        </>
      )}

      {userRole === 'Professor' && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('ScheduleScreen')}>
            <Text style={styles.buttonText}>Horários e Sala</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('AttendanceScreen')}>
            <Text style={styles.buttonText}>Anotar Presença</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('TasksScreen')}>
            <Text style={styles.buttonText}>Tarefas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('StudentsScreen')}>
            <Text style={styles.buttonText}>Estudantes</Text>
          </TouchableOpacity>
        </>
      )}

      {userRole === 'Aluno' && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('ScheduleScreen')}>
            <Text style={styles.buttonText}>Horários</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('ChatScreen')}>
            <Text style={styles.buttonText}>Chat com o Professor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('FinanceScreen')}>
            <Text style={styles.buttonText}>Financeiro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('TasksScreen')}>
            <Text style={styles.buttonText}>Tarefas</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1b1f', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 30 },
  button: { backgroundColor: '#d4af37', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, marginVertical: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#1c1b1f', fontSize: 18, fontWeight: 'bold' },
});
