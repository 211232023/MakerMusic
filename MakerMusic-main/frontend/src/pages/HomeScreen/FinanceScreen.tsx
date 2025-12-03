import React, { useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert 
} from "react-native";

type FinanceRecord = { id: string; description: string; value: number };

export default function Financeiro() {
  const [finances, setFinances] = useState<FinanceRecord[]>([
    { id: "1", description: "Mensalidade Maria", value: 200 },
    { id: "2", description: "Mensalidade João", value: 250 },
    { id: "3", description: "Venda de Livro", value: 50 },
    { id: "4", description: "Manutenção de Piano", value: -120 },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newValue, setNewValue] = useState("");

  const totalRevenue = finances.reduce((sum, record) => sum + record.value, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleAddRecord = () => {
    if (!newDescription.trim() || !newValue.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const valueNumber = parseFloat(newValue.replace(",", "."));
    if (isNaN(valueNumber)) {
      Alert.alert("Erro", "Valor inválido.");
      return;
    }

    const newRecord: FinanceRecord = {
      id: Date.now().toString(),
      description: newDescription,
      value: valueNumber,
    };

    setFinances(prev => [...prev, newRecord]);
    setNewDescription("");
    setNewValue("");
    setModalVisible(false);
  };

  const renderFinanceItem = ({ item }: { item: FinanceRecord }) => (
    <View style={styles.card}>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={[styles.value, item.value >= 0 ? styles.positive : styles.negative]}>
        {formatCurrency(item.value)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Financeiro</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Receita Total</Text>
        <Text style={[styles.totalText, totalRevenue >= 0 ? styles.positive : styles.negative]}>
          {formatCurrency(totalRevenue)}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={finances}
        keyExtractor={item => item.id}
        renderItem={renderFinanceItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal para adicionar registro */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Novo Registro</Text>

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              placeholderTextColor="#aaa"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 200 ou -50)"
              placeholderTextColor="#aaa"
              value={newValue}
              onChangeText={setNewValue}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddRecord}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1b1f", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#f6e27f" },
  addButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#d4af37", justifyContent: "center", alignItems: "center",
  },
  addButtonText: { color: "#1c1b1f", fontSize: 24, fontWeight: "bold" },

  summaryBox: {
    backgroundColor: "#2a292d", padding: 15, borderRadius: 12,
    marginBottom: 20, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3, elevation: 3,
  },
  summaryText: { color: "#fff", fontSize: 18 },
  totalText: { fontSize: 26, fontWeight: "bold", marginTop: 5 },

  card: {
    flexDirection: "row", justifyContent: "space-between",
    padding: 15, backgroundColor: "#2a292d", borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3, elevation: 3,
  },
  description: { color: "#f6e27f", fontSize: 16, fontWeight: "bold" },
  value: { fontSize: 16, fontWeight: "bold" },
  positive: { color: "#2ecc71" },
  negative: { color: "#e74c3c" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "#1c1b1f", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#f6e27f", marginBottom: 15, textAlign: "center" },
  input: {
    width: "100%", backgroundColor: "#333", color: "#fff",
    padding: 12, borderRadius: 10, marginBottom: 15,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#e74c3c" },
  saveButton: { backgroundColor: "#d4af37" },
  modalButtonText: { color: "#1c1b1f", fontWeight: "bold", fontSize: 16 },
});
