import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Aluno");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await AsyncStorage.getItem("@users");
      if (data) setUsers(JSON.parse(data));
    } catch (e) {
      console.log(e);
    }
  };

  const saveUsers = async (newUsers) => {
    try {
      await AsyncStorage.setItem("@users", JSON.stringify(newUsers));
    } catch (e) {
      console.log(e);
    }
  };

  const addOrEditUser = () => {
    if (!name.trim()) {
      return Alert.alert("Erro", "Digite o nome do usuário!");
    }

    if (editingId) {
      const newUsers = users.map((user) =>
        user.id === editingId ? { ...user, name, role } : user
      );
      setUsers(newUsers);
      saveUsers(newUsers);
      setEditingId(null);
    } else {
      const newUsers = [...users, { id: Date.now().toString(), name, role }];
      setUsers(newUsers);
      saveUsers(newUsers);
    }

    setName("");
    setRole("Aluno");
  };

  const editUser = (user) => {
    setName(user.name);
    setRole(user.role);
    setEditingId(user.id);
  };

  const deleteUser = (id) => {
    const newUsers = users.filter((user) => user.id !== id);
    setUsers(newUsers);
    saveUsers(newUsers);
  };

  const filteredUsers = users.filter((user) =>
    filter === "Todos" ? true : user.role === filter
  );

  // Componente interno para cada item
  const UserItem = ({ user }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userRole}>{user.role}</Text>
      <View style={styles.userButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editUser(user)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteUser(user.id)}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciamento de Usuários</Text>

      <TextInput
        placeholder="Nome do usuário"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      <View style={styles.roleContainer}>
        {["Aluno", "Professor"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.roleButtonSelected]}
            onPress={() => setRole(r)}
          >
            <Text style={role === r ? styles.roleTextSelected : styles.roleText}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addOrEditUser}>
        <Text style={styles.addButtonText}>
          {editingId ? "Salvar Alterações" : "Adicionar Usuário"}
        </Text>
      </TouchableOpacity>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por:</Text>
        <View style={styles.roleContainer}>
          {["Todos", "Aluno", "Professor"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonSelected]}
              onPress={() => setFilter(f)}
            >
              <Text style={filter === f ? styles.filterTextSelected : styles.filterText}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserItem user={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#1c1b1f" },
  title: { fontSize: 26, fontWeight: "bold", color: "#f6e27f", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#f6e27f",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    color: "#fff",
  },
  roleContainer: { flexDirection: "row", gap: 10, marginBottom: 10 },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
  },
  roleButtonSelected: { backgroundColor: "#f6e27f" },
  roleText: { color: "#fff", fontWeight: "bold" },
  roleTextSelected: { color: "#1c1b1f", fontWeight: "bold" },
  addButton: {
    backgroundColor: "#d4af37",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: { color: "#1c1b1f", fontSize: 18, fontWeight: "bold" },
  filterContainer: { marginBottom: 20 },
  filterLabel: { color: "#e0d9c0", marginBottom: 5, fontSize: 16 },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
    marginHorizontal: 2,
  },
  filterButtonSelected: { backgroundColor: "#f6e27f" },
  filterText: { color: "#fff", fontWeight: "bold" },
  filterTextSelected: { color: "#1c1b1f", fontWeight: "bold" },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a292c",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userName: { color: "#e0d9c0", fontWeight: "bold", fontSize: 16 },
  userRole: { color: "#f6e27f", fontWeight: "bold", fontSize: 14 },
  userButtons: { flexDirection: "row", gap: 8 },
  editButton: {
    backgroundColor: "#f6e27f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: { color: "#1c1b1f", fontWeight: "bold" },
});
