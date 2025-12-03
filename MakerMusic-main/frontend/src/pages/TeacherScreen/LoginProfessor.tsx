import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../src/types/types";
import { useUser } from "../src/UserContext";

export default function ProfessorMenuScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useUser(); 
  const userRole = user?.role; 

  if (userRole !== "PROFESSOR") {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>Acesso Negado</Text>
        <Text style={styles.subtitle}>Você não tem permissão para visualizar esta tela.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, Professor!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Tarefas")}
      >
        <Text style={styles.buttonText}>Gerenciar Tarefas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Presenca")}
      >
        <Text style={styles.buttonText}>Marcar Presença</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Chat")}
      >
        <Text style={styles.buttonText}>Chat com Alunos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1b1f",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f6e27f",
    marginBottom: 10,
    marginTop: 50,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#d4af37",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
  },
  buttonText: {
    color: "#1c1b1f",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});