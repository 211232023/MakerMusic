import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Modal, Image, Alert, ScrollView, Dimensions, Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMyPayments, updatePaymentStatus } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PymentsScreen() {
  const navigation = useNavigation();
  const { token, user } = useUser();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalPix, setModalPix] = useState(false);
  const [modalBoleto, setModalBoleto] = useState(false);
  const [modalCartao, setModalCartao] = useState(false);
  const [cartaoType, setCartaoType] = useState('CREDITO');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (token) {
      setIsLoading(true);
      try {
        const data = await getMyPayments(token);
        if (Array.isArray(data)) setPayments(data);
      } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchPayments(); }, [fetchPayments]));

  const handlePayPress = (payment: any) => {
    setSelectedPayment(payment);
    setPaymentMethodModal(true);
  };

  const selectMethod = (method: string) => {
    setPaymentMethodModal(false);
    if (method === 'PIX') setModalPix(true);
    else if (method === 'BOLETO') setModalBoleto(true);
    else if (method === 'CREDITO' || method === 'DEBITO') {
      setCartaoType(method);
      setModalCartao(true);
    }
  };

  const closeAllModals = () => {
    setModalPix(false); 
    setModalBoleto(false); 
    setModalCartao(false);
    setPaymentMethodModal(false);
  };

  const processPayment = async () => {
    if (!selectedPayment || !token) return;
    
    setIsLoading(true);
    try {
      await updatePaymentStatus(selectedPayment.id, 'PAGO', token);
      
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === selectedPayment.id ? { ...p, status: 'PAGO' } : p
        )
      );

      closeAllModals();
      
      Alert.alert(
        "Sucesso!",
        "Seu pagamento foi processado e confirmado.",
        [{ text: "OK", onPress: () => fetchPayments() }]
      );
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === selectedPayment.id ? { ...p, status: 'PAGO' } : p
        )
      );

      closeAllModals();

      Alert.alert(
        "Pagamento Confirmado",
        "O status foi alterado para PAGO visualmente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    try {
      const date = new Date(dateString.split('T')[0] + 'T12:00:00');
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return "Data inválida";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAGO': return styles.statusPaid;
      case 'PENDENTE': return styles.statusPending;
      case 'ATRASADO': return styles.statusOverdue;
      default: return {};
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAGO': return 'checkmark-circle';
      case 'PENDENTE': return 'time-outline';
      case 'ATRASADO': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  if (isLoading && !payments.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#f6e27f" />
          <Text style={styles.loadingText}>Carregando informações financeiras...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f6e27f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="wallet-outline" size={32} color="#f6e27f" />
            <Text style={styles.title}>Meu Financeiro</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>Nenhuma cobrança encontrada</Text>
              <Text style={styles.emptySubtext}>Você está em dia com seus pagamentos!</Text>
            </View>
          ) : (
            <View style={styles.paymentsContainer}>
              {payments.map((item) => (
                <View key={item.id.toString()} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.description}>{item.description || 'Mensalidade'}</Text>
                      <Text style={styles.amount}>R$ {parseFloat(String(item.amount)).toFixed(2)}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      getStatusStyle(item.status)
                    ]}>
                      <Ionicons 
                        name={getStatusIcon(item.status)} 
                        size={18} 
                        color={
                          item.status === 'PAGO' ? '#81c784' : 
                          item.status === 'ATRASADO' ? '#e57373' : '#ffb74d'
                        } 
                      />
                      <Text style={[styles.statusText, getStatusStyle(item.status)]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#aaa" />
                    <Text style={styles.date}>Vencimento: {formatDate(item.payment_date)}</Text>
                  </View>

                  {item.status !== 'PAGO' && (
                    <TouchableOpacity 
                      style={styles.payButton} 
                      onPress={() => handlePayPress(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="card-outline" size={20} color="#1c1b1f" />
                      <Text style={styles.payButtonText}>Pagar Agora</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Modal de Seleção de Método */}
        <Modal visible={paymentMethodModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.methodView}>
              <Text style={styles.modalTitle}>Escolha como pagar</Text>
              <TouchableOpacity style={styles.methodItem} onPress={() => selectMethod('PIX')}>
                <Ionicons name="qr-code-outline" size={24} color="#f6e27f" />
                <Text style={styles.methodLabel}>Pix</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.methodItem} onPress={() => selectMethod('CREDITO')}>
                <Ionicons name="card-outline" size={24} color="#f6e27f" />
                <Text style={styles.methodLabel}>Cartão de Crédito</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.methodItem} onPress={() => selectMethod('DEBITO')}>
                <Ionicons name="card-outline" size={24} color="#f6e27f" />
                <Text style={styles.methodLabel}>Cartão de Débito</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.methodItem} onPress={() => selectMethod('BOLETO')}>
                <Ionicons name="barcode-outline" size={24} color="#f6e27f" />
                <Text style={styles.methodLabel}>Boleto Bancário</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setPaymentMethodModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Boleto Bancário */}
        <Modal visible={modalBoleto} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.boletoScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.boletoView}>
                <View style={styles.boletoHeader}>
                  <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Itau_logo.svg/1000px-Itau_logo.svg.png' }} style={styles.bankLogo} />
                  <View style={styles.bankDivider} />
                  <Text style={styles.bankCode}>341-7</Text>
                  <View style={styles.bankDivider} />
                  <Text style={styles.boletoLine}>34191.79001 01043.510047 91020.150008 9 95430000015000</Text>
                </View>

                <View style={styles.boletoBody}>
                  <View style={styles.boletoRow}>
                    <View style={[styles.boletoField, { flex: 3 }]}>
                      <Text style={styles.fieldLabel}>Local de Pagamento</Text>
                      <Text style={styles.fieldText}>PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO</Text>
                    </View>
                    <View style={[styles.boletoField, { flex: 1, borderRightWidth: 0 }]}>
                      <Text style={styles.fieldLabel}>Vencimento</Text>
                      <Text style={[styles.fieldText, { fontWeight: 'bold' }]}>{selectedPayment ? formatDate(selectedPayment.payment_date) : ''}</Text>
                    </View>
                  </View>

                  <View style={styles.boletoRow}>
                    <View style={[styles.boletoField, { flex: 3 }]}>
                      <Text style={styles.fieldLabel}>Beneficiário</Text>
                      <Text style={styles.fieldText}>ESCOLA DE MÚSICA MAKERMUSIC LTDA</Text>
                    </View>
                    <View style={[styles.boletoField, { flex: 1, borderRightWidth: 0 }]}>
                      <Text style={styles.fieldLabel}>Agência/Código Beneficiário</Text>
                      <Text style={styles.fieldText}>0246 / 99873-6</Text>
                    </View>
                  </View>

                  <View style={styles.boletoRow}>
                    <View style={[styles.boletoField, { flex: 3 }]}>
                      <Text style={styles.fieldLabel}>Instruções</Text>
                      <Text style={styles.fieldSmallText}>REFERENTE À MENSALIDADE DE CURSO DE MÚSICA.</Text>
                    </View>
                    <View style={[styles.boletoField, { flex: 1, backgroundColor: '#f0f0f0', borderRightWidth: 0 }]}>
                      <Text style={styles.fieldLabel}>(=) Valor do Documento</Text>
                      <Text style={[styles.fieldText, { textAlign: 'right', fontWeight: 'bold' }]}>R$ {selectedPayment ? parseFloat(selectedPayment.amount).toFixed(2) : ''}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={processPayment}>
                  <Text style={styles.confirmButtonText}>Pagar Boleto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalBoleto(false)}>
                  <Text style={styles.closeButtonText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal Cartão */}
        <Modal visible={modalCartao} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.cartaoView}>
              <Ionicons name="card" size={50} color="#f6e27f" />
              <Text style={styles.modalTitle}>Cartão de {cartaoType === 'CREDITO' ? 'Crédito' : 'Débito'}</Text>
              <View style={styles.cardInput}><Text style={{color: '#aaa'}}>**** **** **** 4242</Text></View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <View style={[styles.cardInput, {width: '48%'}]}><Text style={{color: '#aaa'}}>12/29</Text></View>
                <View style={[styles.cardInput, {width: '48%'}]}><Text style={{color: '#aaa'}}>***</Text></View>
              </View>
              <TouchableOpacity style={styles.confirmButton} onPress={processPayment}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#1c1b1f" />
                <Text style={styles.confirmButtonText}>Pagar R$ {selectedPayment ? parseFloat(selectedPayment.amount).toFixed(2) : ''}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalCartao(false)}>
                <Text style={styles.closeButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Pix */}
        <Modal visible={modalPix} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pixView}>
              <Text style={styles.modalTitle}>Pagar com Pix</Text>
              <Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MakerMusicPix' }} style={styles.qrCode} />
              <Text style={styles.pixKey}>a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6</Text>
              <TouchableOpacity style={styles.confirmButton} onPress={processPayment}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#1c1b1f" />
                <Text style={styles.confirmButtonText}>Já paguei</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalPix(false)}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f',
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#f6e27f',
  },
  loadingText: {
    color: '#aaa', 
    marginTop: 15,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  paymentsContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 15,
  },
  paymentCard: { 
    backgroundColor: '#2a292e', 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  description: { 
    color: '#fff',
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 6,
  },
  amount: { 
    color: '#f6e27f', 
    fontSize: 22, 
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusPaid: { 
    backgroundColor: '#81c78420',
  },
  statusPending: {
    backgroundColor: '#ffb74d20',
  },
  statusOverdue: { 
    backgroundColor: '#e5737320',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  date: { 
    color: '#aaa', 
    fontSize: 14,
  },
  payButton: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14, 
    borderRadius: 12,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.85)' 
  },
  methodView: { 
    width: '85%', 
    maxWidth: 400, 
    backgroundColor: '#2a292e', 
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  methodItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1c1b1f', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    gap: 12,
  },
  methodLabel: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: { 
    marginTop: 8, 
    alignItems: 'center',
    padding: 10,
  },
  cancelText: { 
    color: '#e57373', 
    fontWeight: 'bold', 
    fontSize: 15,
  },
  boletoScroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingVertical: 20 
  },
  boletoView: { 
    width: width * 0.95, 
    maxWidth: 450, 
    backgroundColor: '#fff', 
    padding: 8, 
    alignSelf: 'center', 
    borderRadius: 4 
  },
  boletoHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#000', 
    paddingBottom: 3 
  },
  bankLogo: { 
    width: 30,
    height: 30, 
    resizeMode: 'contain' 
  },
  bankDivider: { 
    width: 1.5, 
    height: 25, 
    backgroundColor: '#000', 
    marginHorizontal: 8 
  },
  bankCode: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  boletoLine: { 
    fontSize: 9, 
    fontWeight: 'bold', 
    flex: 1, 
    textAlign: 'right', 
    color: '#000' 
  },
  boletoBody: { 
    borderWidth: 1, 
    borderColor: '#000', 
    marginTop: 8 
  },
  boletoRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#000' 
  },
  boletoField: { 
    padding: 4, 
    borderRightWidth: 1, 
    borderRightColor: '#000', 
    flex: 1 
  },
  fieldLabel: { 
    fontSize: 7, 
    color: '#000', 
    textTransform: 'uppercase', 
    fontWeight: 'bold' 
  },
  fieldText: { 
    fontSize: 9, 
    color: '#000' 
  },
  fieldSmallText: { 
    fontSize: 7, 
    color: '#333' 
  },
  cartaoView: { 
    width: '85%', 
    maxWidth: 400, 
    backgroundColor: '#2a292e', 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  pixView: { 
    width: '85%', 
    maxWidth: 400, 
    backgroundColor: '#2a292e', 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center' 
  },
  cardInput: { 
    backgroundColor: '#1c1b1f', 
    padding: 14, 
    borderRadius: 10, 
    width: '100%', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#444' 
  },
  confirmButton: { 
    backgroundColor: '#f6e27f', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14, 
    borderRadius: 12, 
    width: '100%', 
    marginTop: 10,
    gap: 8,
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: { 
    color: '#1c1b1f', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
  closeButton: { 
    marginTop: 12, 
    padding: 8,
  },
  closeButtonText: { 
    color: '#888', 
    fontWeight: '600', 
    fontSize: 14,
  },
  qrCode: { 
    width: 180, 
    height: 180, 
    marginBottom: 20, 
    backgroundColor: '#fff', 
    borderRadius: 10,
    padding: 10,
  },
  pixKey: { 
    color: '#fff', 
    fontSize: 11, 
    padding: 12, 
    backgroundColor: '#1c1b1f', 
    borderRadius: 8, 
    marginBottom: 20, 
    textAlign: 'center', 
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});