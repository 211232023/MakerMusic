import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMyPayments } from '../../services/api';

// Imagem de QR Code fictícia - coloque-a na sua pasta `assets`
const fakeQrCode = require('../../assets/fake-qr-code.png'); 

type Payment = {
  id: number;
  amount: number;
  description: string;
  payment_date: string;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
};

export default function PymentsScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    if (token) {
      setIsLoading(true);
      const data = await getMyPayments(token);
      if (Array.isArray(data)) setPayments(data);
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(fetchPayments);

  const handlePay = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalVisible(true);
  };
  
  const getStatusStyle = (status: Payment['status']) => {
    if (status === 'PAGO') return { color: 'green' };
    if (status === 'ATRASADO') return { color: 'red' };
    return { color: 'orange' };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Financeiro</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.paymentItem}>
              <View>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
                <Text style={styles.date}>Vencimento: {new Date(item.payment_date).toLocaleDateString()}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
                {item.status !== 'PAGO' && (
                  <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item)}>
                    <Text style={styles.payButtonText}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum registo financeiro encontrado.</Text>}
        />
      )}
      
      {/* Modal do PIX */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Pagar com Pix</Text>
            <Image source={fakeQrCode} style={styles.qrCode} />
            <Text style={styles.pixKeyLabel}>Chave Pix (Copia e Cola):</Text>
            <Text style={styles.pixKey}>a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => {
                setModalVisible(false);
                Alert.alert("Pagamento Simulado", "Numa aplicação real, o status seria atualizado após a confirmação do pagamento.");
            }}>
                <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#f6e27f', marginBottom: 20, marginTop: 40, textAlign: 'center' },
    paymentItem: { backgroundColor: '#333', padding: 20, borderRadius: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    description: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    amount: { color: '#f6e27f', fontSize: 16, marginVertical: 4 },
    date: { color: '#ccc', fontSize: 14 },
    status: { fontSize: 16, fontWeight: 'bold' },
    payButton: { backgroundColor: '#d4af37', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5, marginTop: 8 },
    payButtonText: { color: '#1c1b1f', fontWeight: 'bold' },
    emptyText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginTop: 50 },
    backButton: { marginTop: 20, alignSelf: 'center' },
    backButtonText: { color: '#d4af37', fontSize: 16 },
    // Estilos do Modal
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalView: { width: '85%', backgroundColor: '#333', borderRadius: 20, padding: 25, alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#f6e27f', marginBottom: 15 },
    qrCode: { width: 200, height: 200, marginBottom: 20 },
    pixKeyLabel: { color: '#ccc', fontSize: 14 },
    pixKey: { color: '#fff', fontSize: 12, padding: 10, backgroundColor: '#222', borderRadius: 5, marginVertical: 10, textAlign: 'center' },
    closeButton: { backgroundColor: '#8B0000', padding: 12, borderRadius: 10, marginTop: 20 },
    closeButtonText: { color: '#fff', fontWeight: 'bold' },
});