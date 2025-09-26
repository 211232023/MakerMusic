import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

type User = { 
  id: string; 
  name: string; 
  email: string; 
  role: "Aluno" | "Professor" | "Admin" 
};

export default function Entidades() {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Maria", email: "maria@email.com", role: "Aluno" },
    { id: "2", name: "João", email: "joao@email.com", role: "Professor" },
  ]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Aluno" | "Professor" | "Admin">("Aluno");

  const deleteUser = (id: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este usuário?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => setUsers(prev => prev.filter(u => u.id !== id)) },
      ]
    );
  };

  const handleAddUser = () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      role: newRole,
    };

    setUsers(prev => [...prev, newUser]);

    setNewName("");
    setNewEmail("");
    setNewRole("Aluno");

    Alert.alert("Sucesso", "Usuário adicionado com sucesso!");
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteUser(item.id)}>
        <Text style={styles.deleteText}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Usuários</Text>

      {/* Formulário */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#aaa"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.buttonText}>Adicionar Usuário</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de usuários */}
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#f6e27f", marginBottom: 20 },

  // Formulário
  formContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#2a292d",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    width: "100%",
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#d4af37",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#1c1b1f", fontWeight: "bold", fontSize: 16 },

  // Lista de usuários
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a292d",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: { color: "#f6e27f", fontSize: 16, fontWeight: "bold" },
  userRole: { color: "#e0d9c0", fontSize: 14, marginTop: 2 },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  deleteText: { color: "#fff", fontWeight: "bold" },
});
