import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import { getFinanceStats } from '../../services/api';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

type FinanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuButton {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: keyof RootStackParamList;
  color: string;
  description: string;
}

const menuItems: MenuButton[] = [
  { 
    icon: 'cash-outline', 
    label: 'Lançar Mensalidade', 
    route: 'AdminFinance', 
    color: '#ffb74d',
    description: 'Registrar pagamentos de alunos'
  },
];

export default function FinanceScreen() {
  const navigation = useNavigation<FinanceScreenNavigationProp>();
  const { user, logout, token, setViewRole } = useUser();
  const [stats, setStats] = React.useState({ paid: 0, pending: 0, overdue: 0 });

  const fetchStats = React.useCallback(async () => {
    if (token) {
      try {
        const data = await getFinanceStats(token);
        if (data && !data.message) {
          setStats(data);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    }
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const handleLogout = () => {
    if (user?.role === 'ADMIN') {
      setViewRole(null);
    } else {
      logout();
    }
  };

  const handleNavigate = (route: keyof RootStackParamList) => {
    navigation.navigate(route as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1b1f" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={styles.header}>
          <Logo size="large" />
          <Text style={styles.title}>MakerMusic</Text>
          <Text style={styles.subtitle}>Painel Financeiro</Text>
          <View style={styles.userBadge}>
            <Ionicons name="wallet" size={24} color="#f6e27f" />
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumo Rápido</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color="#81c784" />
              <Text style={styles.statValue}>{stats.paid}</Text>
              <Text style={styles.statLabel}>Pagos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={28} color="#ffb74d" />
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={28} color="#e57373" />
              <Text style={styles.statValue}>{stats.overdue}</Text>
              <Text style={styles.statLabel}>Atrasados</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuCard, isLargeScreen && styles.menuCardWeb]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={32} color={item.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>
            {user?.role === 'ADMIN' ? 'Voltar ao Painel Admin' : 'Sair'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1c1b1f', 
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 15,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a292e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
    gap: 8,
  },
  userName: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 30,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statCard: {
    backgroundColor: '#2a292e',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    minWidth: isLargeScreen ? 150 : 90,
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  menuGrid: {
    gap: 15,
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  menuCard: {
    backgroundColor: '#2a292e',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  menuCardWeb: {
    maxWidth: isLargeScreen ? '100%' : 600,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    color: '#aaa',
    fontSize: 12,
  },
  logoutButton: { 
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#a00',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});