import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useUser } from "../src/UserContext";
import { useNavigation } from "@react-navigation/native";

type Student = {
  id: string;
  name: string;
  class: string;
};

const sampleStudents: Student[] = [
  { id: "1", name: "Maria Oliveira", class: "Piano Básico" },
  { id: "2", name: "João Santos", class: "Violão Intermediário" },
  { id: "3", name: "Ana Pereira", class: "Bateria Avançada" },
];

export default function EstudantesScreen() {
  const { user } = useUser();
  const userRole = user?.role;
  const navigation = useNavigation();
  const [students, setStudents] = useState<Student[]>(sampleStudents);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estudantes</Text>
        {userRole === "Admin" && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => Alert.alert("Funcionalidade futura", "Adicionar novo estudante")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentClass}>{item.class}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#f6e27f" },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#d4af37", justifyContent: "center", alignItems: "center" },
  addButtonText: { color: "#1c1b1f", fontSize: 24, fontWeight: "bold" },
  studentItem: { backgroundColor: "#333", padding: 15, borderRadius: 10, marginBottom: 10 },
  studentName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  studentClass: { color: "#aaa", fontSize: 14, marginTop: 4 },
});