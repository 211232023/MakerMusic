import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";

export default function UserItem({ user, editUser, deleteUser }) {
  if (!user) return null; // Segurança caso user não exista

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o usuário "${user.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteUser(user.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userRole}>{user.role}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.editButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => editUser(user)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.deleteButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2a292d",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // sombra para Android
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    color: "#f6e27f",
    fontSize: 16,
    fontWeight: "bold",
  },
  userRole: {
    color: "#e0d9c0",
    fontSize: 14,
    marginTop: 2,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#d4af37",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#1c1b1f",
    fontWeight: "bold",
    fontSize: 14,
  },
});
