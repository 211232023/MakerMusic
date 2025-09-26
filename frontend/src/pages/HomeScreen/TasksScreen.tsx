import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useUser } from "../src/UserContext";

// Tipagem da tarefa
type TodoItem = {
  id: number;
  text: string;
  completed: boolean;
};

export default function Tarefas() {
  const { user } = useUser();
  const userRole = user?.role;

  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 1, text: "Praticar escala C#", completed: false },
    { id: 2, text: "Exercício 05 do capítulo 7 da apostila", completed: true },
    { id: 3, text: "Praticar música nova", completed: false },
  ]);

  const [newTask, setNewTask] = useState("");

  // Alterna conclusão da tarefa
  const toggleComplete = (id: number) => {
    setTodos(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Adiciona nova tarefa
  const addTask = () => {
    if (!newTask.trim()) return Alert.alert("Erro", "Digite uma tarefa válida");
    const task: TodoItem = { id: Date.now(), text: newTask, completed: false };
    setTodos(prev => [...prev, task]);
    setNewTask("");
  };

  // Remove tarefa
  const deleteTask = (id: number) => {
    setTodos(prev => prev.filter(item => item.id !== id));
  };

  // Renderiza cada item da lista
  const renderTodoItem = ({ item }: { item: TodoItem }) => {
    const isEditable = userRole === "Professor" || userRole === "Admin";

    return (
      <View style={[styles.todoItem, item.completed && styles.todoItemCompleted]}>
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
          onPress={() => toggleComplete(item.id)}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <Text style={[styles.todoText, item.completed && styles.completed]}>
          {item.text}
        </Text>

        {isEditable && (
          <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={10}
    >
      <Text style={styles.title}>Minhas Tarefas</Text>

      {/* Input e botão de adicionar tarefas */}
      {(userRole === "Professor" || userRole === "Admin") && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nova tarefa"
            placeholderTextColor="#aaa"
            value={newTask}
            onChangeText={setNewTask}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={todos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTodoItem}
        ListEmptyComponent={
          <Text style={[styles.text, { textAlign: "center", marginTop: 20 }]}>
            Nenhuma tarefa cadastrada
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 16 },
  title: { fontSize: 26, color: "#f6e27f", fontWeight: "bold", marginBottom: 16 },
  text: { color: "#e0d9c0", fontSize: 16 },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#2a292c",
    borderRadius: 12,
  },
  todoItemCompleted: { backgroundColor: "#3b3a3e" },
  todoText: { flex: 1, color: "#e0d9c0", fontSize: 16, marginLeft: 12 },
  completed: { textDecorationLine: "line-through", color: "#888" },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#d4af37",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#d4af37" },
  checkmark: { color: "#1c1b1f", fontWeight: "bold" },
  deleteButton: { marginLeft: 10 },
  deleteButtonText: { color: "#f00", fontSize: 18 },
  inputContainer: { flexDirection: "row", marginVertical: 10 },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "#e0d9c0",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#d4af37",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#1c1b1f", fontWeight: "bold", fontSize: 16 },
});
