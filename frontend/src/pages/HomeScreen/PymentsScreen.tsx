import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useUser } from "../src/UserContext";

type Payment = { id: string; student: string; amount: number };

export default function Pagamento() {
  const { user } = useUser();
  const userRole = user?.role;
  const [payments, setPayments] = useState<Payment[]>([
    { id: "1", student: "Maria", amount: 200 },
    { id: "2", student: "João", amount: 250 },
    { id: "3", student: "Ana", amount: 200 },
  ]);
  
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.item}>
      <Text style={styles.text}>{item.student}</Text>
      <Text style={styles.text}>{formatCurrency(item.amount)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos</Text>
        {(userRole === "Admin" || userRole === "Financeiro") && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => alert("Adicionar novo pagamento")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Recebido:</Text>
        <Text style={styles.totalText}>{formatCurrency(totalAmount)}</Text>
      </View>

      <FlatList
        data={payments}
        keyExtractor={item => item.id}
        renderItem={renderPaymentItem}
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
  summaryBox: { backgroundColor: "#2a292d", padding: 15, borderRadius: 10, marginBottom: 20, alignItems: "center" },
  summaryText: { color: "#fff", fontSize: 18 },
  totalText: { fontSize: 24, fontWeight: "bold", marginTop: 5, color: "#2ecc71" },
  item: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "#333", borderRadius: 10, marginBottom: 10 },
  text: { color: "#fff", fontSize: 16 },
});
