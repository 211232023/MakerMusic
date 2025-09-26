import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../src/types/navigation";

export default function AdminHomeScreen() {
  // Tipando a navegação corretamente
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel Admin</Text>

      {/* Botão de Alunos */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("StudentsScreen")}
        accessibilityLabel="Ir para lista de alunos"
        accessible
      >
        <MaterialCommunityIcons name="account-school-outline" size={24} color="#1c1b1f" />
        <Text style={styles.buttonText}>Alunos</Text>
      </TouchableOpacity>

      {/* Botão Financeiro */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("FinanceScreen")}
        accessibilityLabel="Ir para painel financeiro"
        accessible
      >
        <MaterialCommunityIcons name="finance" size={24} color="#1c1b1f" />
        <Text style={styles.buttonText}>Financeiro</Text>
      </TouchableOpacity>

      {/* Botão de Entidades */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EntitiesScreen")}
        accessibilityLabel="Ir para entidades"
        accessible
      >
        <MaterialCommunityIcons name="domain" size={24} color="#1c1b1f" />
        <Text style={styles.buttonText}>Entidades</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1c1b1f", 
    padding: 20, 
    justifyContent: "center" 
  },
  title: { 
    color: "#f6e27f", 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 30 
  },
  button: {
    backgroundColor: "#d4af37",
    padding: 15,
    borderRadius: 10,
    marginVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#1c1b1f",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
});
