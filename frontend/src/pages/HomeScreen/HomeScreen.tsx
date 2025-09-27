import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
// Importe os tipos do ficheiro central
import { RootStackParamList } from '../src/types/navigation'; 

// Use o tipo importado para tipar a navegação
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useUser(); 

  const handleLogout = () => {
    Alert.alert("Sair", "Tem a certeza?", [{ text: "Cancelar" }, { text: "Sair", onPress: logout }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MakerMusic</Text>
        <Text style={styles.userName}>Olá, {user?.name}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Agora estas chamadas são totalmente tipadas e corretas */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HorariosScreen')}>
          <Text style={styles.buttonText}>Horários</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatScreen')}>
          <Text style={styles.buttonText}>Chat com Professor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PymentsScreen')}>
          <Text style={styles.buttonText}>Financeiro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TasksScreen')}>
          <Text style={styles.buttonText}>Tarefas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={[styles.buttonText, styles.logoutButtonText]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20, justifyContent: 'space-between' },
  header: { alignItems: 'center', paddingTop: 40 },
  title: { color: '#f6e27f', fontSize: 32, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 18, marginTop: 10 },
  buttonContainer: { width: '100%', marginBottom: 30 },
  button: { backgroundColor: '#333', padding: 20, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  logoutButton: { backgroundColor: '#8B0000', marginTop: 20 },
  logoutButtonText: { color: '#fff' },
});