import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useUser } from "../src/UserContext";

interface Student {
  id: string;
  name: string;
  instrument: string;
}

interface User {
  id: string;
  name: string;
  role: "Aluno" | "Professor" | "Admin" | "Financeiro";
}

export default function Estudantes() {
  const { user } = useUser() as { user: User | null };
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Maria", instrument: "Piano" },
    { id: "2", name: "João", instrument: "Violão" },
    { id: "3", name: "Ana", instrument: "Bateria" },
  ]);

  const deleteStudent = (id: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza de que deseja excluir este aluno?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => setStudents(prev => prev.filter(student => student.id !== id)),
        },
      ]
    );
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <View style={styles.studentItem}>
      <Text style={styles.studentText}>{item.name} - {item.instrument}</Text>
      {(user && (user.role === "Admin" || user.role === "Professor")) && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteStudent(item.id)}>
          <Text style={styles.deleteText}>Excluir</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alunos</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderStudent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno cadastrado</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // Corrected this line
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentText: {
    fontSize: 18,
    color: "#555",
  },
  deleteButton: {
    backgroundColor: "#ff6347",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});