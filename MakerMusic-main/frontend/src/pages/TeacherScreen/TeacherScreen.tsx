import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import { getTeacherStats } from '../../services/api';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

interface MenuButton {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: keyof RootStackParamList;
  color: string;
}

const menuItems: MenuButton[] = [
  { icon: 'clipboard-outline', label: 'Gerenciar Tarefas', route: 'TasksScreen', color: '#64b5f6' },
  { icon: 'calendar-outline', label: 'Criar Horário de Aula', route: 'AddSchedule', color: '#81c784' },
  { icon: 'checkmark-done-outline', label: 'Lista de Presença', route: 'PresençaScreen', color: '#ffb74d' },
  { icon: 'chatbubbles-outline', label: 'Conversar com Alunos', route: 'TeacherChatList', color: '#ba68c8' },
  { icon: 'bar-chart-outline', label: 'Desempenho dos Alunos', route: 'TeacherPerformanceList', color: '#e57373' },
];

export default function TeacherScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, token, viewRole } = useUser();
  const [stats, setStats] = React.useState({ students: 0, classesToday: 0, tasks: 0 });

  const fetchStats = React.useCallback(async () => {
    if (token) {
      try {
        const data = await getTeacherStats(token);
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
    logout();
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
          <Text style={styles.subtitle}>Painel do Professor</Text>
          <View style={styles.userBadge}>
            <Ionicons name="person-circle" size={24} color="#f6e27f" />
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart-outline" size={24} color="#f6e27f" />
            <Text style={styles.sectionTitle}>Estatísticas Rápidas</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderColor: '#64b5f6' }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(100, 181, 246, 0.2)' }]}>
                <Ionicons name="people" size={28} color="#64b5f6" />
              </View>
              <Text style={styles.statValue}>{stats.students}</Text>
              <Text style={styles.statLabel}>Alunos</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#81c784' }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(129, 199, 132, 0.2)' }]}>
                <Ionicons name="calendar" size={28} color="#81c784" />
              </View>
              <Text style={styles.statValue}>{stats.classesToday}</Text>
              <Text style={styles.statLabel}>Aulas Hoje</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#ffb74d' }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 183, 77, 0.2)' }]}>
                <Ionicons name="clipboard" size={28} color="#ffb74d" />
              </View>
              <Text style={styles.statValue}>{stats.tasks}</Text>
              <Text style={styles.statLabel}>Tarefas</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps-outline" size={24} color="#f6e27f" />
            <Text style={styles.sectionTitle}>Menu Principal</Text>
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
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>
            {user?.role === 'ADMIN' && viewRole === 'PROFESSOR' ? "Voltar ao Painel Admin" : "Sair"}
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
  sectionContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    color: '#f6e27f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsSection: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#2a292e',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    minWidth: isLargeScreen ? 150 : 100,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuGrid: {
    gap: 15,
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