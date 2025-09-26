import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUser } from "../src/UserContext";
import { RootStackParamList } from "../src/types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function ProfessorHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useUser();

  // Apenas professores têm acesso a essa tela.
  if (user?.role !== "Professor") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso Negado</Text>
        <Text style={styles.subtitle}>Você não tem permissão para visualizar esta tela.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MakerMusic - Professor</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TasksScreen")}
      >
        <Text style={styles.buttonText}>Gerenciar Tarefas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TeacherScreen")}
      >
        <Text style={styles.buttonText}>Marcar Presença</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AddScheduleScreen")}
      >
        <Text style={styles.buttonText}>Horários</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonExit} onPress={() => { logout(); navigation.replace("LoginScreen"); }}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#f6e27f", marginBottom: 30, marginTop: 50 },
  subtitle: { fontSize: 18, color: "#fff", textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: "#d4af37", padding: 15, borderRadius: 10, width: "80%", alignItems: "center", marginVertical: 8 },
  buttonExit: { backgroundColor: "#e74c3c", padding: 15, borderRadius: 10, width: "80%", alignItems: "center", marginTop: 20 },
  buttonText: { color: "#1c1b1f", fontWeight: "bold", fontSize: 16 },
});