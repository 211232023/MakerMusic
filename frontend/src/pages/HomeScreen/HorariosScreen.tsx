import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation'; 
import { getMyTeacher } from '../../services/api';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout, token } = useUser(); 

  const handleLogout = () => {
    Alert.alert("Sair", "Tem a certeza?", [{ text: "Cancelar" }, { text: "Sair", onPress: logout }]);
  };

  const handleStudentChat = async () => {
    if (token) {
      try {
        const teacher = await getMyTeacher(token);
        if (teacher && teacher.id) {
          navigation.navigate('Chat', { otherUserId: teacher.id.toString(), otherUserName: teacher.name });
        } else {
          Alert.alert('Nenhum professor encontrado', 'Você ainda não foi vinculado a um professor.');
        }
      } catch (error) {
        console.error("Erro ao buscar professor:", error);
        Alert.alert('Erro', 'Não foi possível obter os dados do seu professor.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MakerMusic</Text>
          <Text style={styles.userName}>Olá, {user?.name}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HorariosScreen')}>
            <Text style={styles.buttonText}>Horários</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleStudentChat}>
            <Text style={styles.buttonText}>Chat com Professor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PymentsScreen')}>
            <Text style={styles.buttonText}>Financeiro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentTasks')}>
            <Text style={styles.buttonText}>Minhas Tarefas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'space-between' 
  },
  header: { 
    alignItems: 'center', 
    // O paddingTop foi movido para o container para melhor alinhamento
  },
  title: { 
    color: '#f6e27f', 
    fontSize: 28, // Ajustado para 28 para corresponder à tela do professor
    fontWeight: 'bold' 
  },
  userName: { 
    color: '#fff', 
    fontSize: 18, 
    marginTop: 10 
  },
  buttonContainer: { 
    width: '100%', 
    marginBottom: 30 
  },
  button: { 
    backgroundColor: '#333', 
    padding: 20, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  logoutButton: { 
    backgroundColor: '#8B0000', 
    marginTop: 20 
  },
  logoutButtonText: { 
    color: '#fff' 
  },
});