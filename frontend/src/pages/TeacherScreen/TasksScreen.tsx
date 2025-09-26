import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

type Task = { id: string; title: string };

export default function TasksScreen() {
  const [tasks] = useState<Task[]>([
    { id: "1", title: "Estudar música" },
    { id: "2", title: "Prática de violão" },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <Text style={styles.taskText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#f6e27f", marginBottom: 20 },
  task: { backgroundColor: "#333", padding: 15, borderRadius: 10, marginBottom: 10 },
  taskText: { color: "#fff", fontSize: 16 },
});
