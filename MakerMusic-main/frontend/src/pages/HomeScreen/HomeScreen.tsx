import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';
import { getMyTeacher, getStudentStats } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuButton {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action: () => void;
  color: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout, token, viewRole } = useUser();
  const { showError, showWarning } = useToast(); 
  const [stats, setStats] = React.useState({ tasks: 0, completedTasks: 0, classes: 0, progress: 0 });

  const fetchStats = React.useCallback(async () => {
    if (token) {
      try {
        console.log('[FRONTEND] Buscando estatísticas do aluno...');
        const data = await getStudentStats(token);
        console.log('[FRONTEND] Dados recebidos:', data);
        if (data && typeof data === 'object' && !data.message) {
          setStats({
            tasks: Number(data.tasks) || 0,
            completedTasks: Number(data.completedTasks) || 0,
            classes: Number(data.classes) || 0,
            progress: Number(data.progress) || 0
          });
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
    logout();
  };

  const handleStudentChat = async () => {
    if (token) {
      try {
        const teacher = await getMyTeacher(token);
        if (teacher && teacher.id) {
          navigation.navigate('Chat', { otherUserId: teacher.id.toString(), otherUserName: teacher.name });
        } else {
          showWarning('Você ainda não foi vinculado a um professor.');
        }
      } catch (error) {
        console.error("Erro ao buscar professor:", error);
        showError('Não foi possível obter os dados do seu professor.');
      }
    }
  };

  const menuItems: MenuButton[] = [
    { icon: 'calendar-outline', label: 'Meus Horários', action: () => navigation.navigate('HorariosScreen', {}), color: '#64b5f6' },
    { icon: 'clipboard-outline', label: 'Minhas Tarefas', action: () => navigation.navigate('StudentTasks'), color: '#81c784' },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat com Professor', action: handleStudentChat, color: '#ba68c8' },
    { icon: 'cash-outline', label: 'Financeiro', action: () => navigation.navigate('PymentsScreen'), color: '#ffb74d' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <Logo size="large" />
            <Text style={styles.title}>MakerMusic</Text>
            <Text style={styles.subtitle}>Painel do Aluno</Text>
            <View style={styles.userBadge}>
              <Ionicons name="person-circle" size={24} color="#f6e27f" />
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart-outline" size={24} color="#f6e27f" />
              <Text style={styles.sectionTitle}>Resumo Rápido</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderColor: '#81c784' }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(129, 199, 132, 0.2)' }]}>
                  <Ionicons name="clipboard" size={28} color="#81c784" />
                </View>
                <Text style={styles.statValue}>{stats.tasks}</Text>
                <Text style={styles.statLabel}>Total Tarefas</Text>
              </View>
              <View style={[styles.statCard, { borderColor: '#4CAF50' }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                  <Ionicons name="checkmark-done" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>{stats.completedTasks}</Text>
                <Text style={styles.statLabel}>Concluídas</Text>
              </View>
              <View style={[styles.statCard, { borderColor: '#64b5f6' }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(100, 181, 246, 0.2)' }]}>
                  <Ionicons name="calendar" size={28} color="#64b5f6" />
                </View>
                <Text style={styles.statValue}>{stats.classes}</Text>
                <Text style={styles.statLabel}>Aulas</Text>
              </View>
              <View style={[styles.statCard, { borderColor: '#ffd54f' }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 213, 79, 0.2)' }]}>
                  <Ionicons name="trophy" size={28} color="#ffd54f" />
                </View>
                <Text style={styles.statValue}>{stats.progress}%</Text>
                <Text style={styles.statLabel}>Progresso</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuCard, isLargeScreen && styles.menuCardWeb]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={32} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
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
            <Text style={styles.logoutButtonText}>
              {user?.role === 'ADMIN' && viewRole === 'ALUNO' ? "Voltar ao Painel Admin" : "Sair"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1b1f',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f6e27f',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#2a292e',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 5,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuGrid: {
    gap: 15,
    marginBottom: 20,
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
  menuLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});