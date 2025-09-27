import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '../src/UserContext'; // Importa o hook para aceder ao logout

export default function AdminScreen() {
  const { logout, user } = useUser(); // Pega a função de logout e o utilizador do contexto

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Tem a certeza de que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: () => logout() } // Chama a função de logout do contexto
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MakerMusic</Text>
      
      {/* Informação de Debug para vermos qual utilizador está carregado */}
      <Text style={styles.debugText}>
        Logado como: {user?.name} ({user?.role})
      </Text>

      {/* Botão para forçar o Logout */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Forçar Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
  },
  title: {
    color: '#f6e27f',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  debugText: {
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#d4af37',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#1c1b1f',
    fontWeight: 'bold',
    fontSize: 18,
  },
});