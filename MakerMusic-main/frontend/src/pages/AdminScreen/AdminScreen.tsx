import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../src/UserContext';
import { RootStackParamList } from '../src/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

interface MenuButton {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: keyof RootStackParamList;
  color: string;
}

const managementItems: MenuButton[] = [
  { icon: 'person-add-outline', label: 'Cadastrar Novo Usuário', route: 'AdminRegisterUser', color: '#64b5f6' },
  { icon: 'people-outline', label: 'Ver Utilizadores', route: 'Entities', color: '#81c784' },
  { icon: 'link-outline', label: 'Vincular Aluno/Professor', route: 'ManageUsers', color: '#ffb74d' },
];

const viewModeItems = [
  { icon: 'school-outline' as keyof typeof Ionicons.glyphMap, label: 'Visão Aluno', role: 'ALUNO', color: '#64b5f6' },
  { icon: 'person-outline' as keyof typeof Ionicons.glyphMap, label: 'Visão Professor', role: 'PROFESSOR', color: '#81c784' },
  { icon: 'cash-outline' as keyof typeof Ionicons.glyphMap, label: 'Visão Financeiro', role: 'FINANCEIRO', color: '#ffb74d' },
];

export default function AdminScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, setViewRole } = useUser();

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
          <Text style={styles.subtitle}>Painel do Administrador</Text>
          <View style={styles.userBadge}>
            <Ionicons name="shield-checkmark" size={24} color="#f6e27f" />
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color="#f6e27f" />
            <Text style={styles.sectionTitle}>Gerenciamento</Text>
          </View>

          <View style={styles.menuGrid}>
            {managementItems.map((item, index) => (
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

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={24} color="#f6e27f" />
            <Text style={styles.sectionTitle}>Alternar Visão</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Visualize o sistema como outros perfis</Text>

          <View style={styles.viewModeGrid}>
            {viewModeItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.viewModeCard, { borderColor: item.color }]}
                onPress={() => setViewRole(item.role as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.viewModeIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.viewModeLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={logout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Sair</Text>
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
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    color: '#f6e27f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 15,
    marginLeft: 34,
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
  viewModeGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  viewModeCard: {
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
  viewModeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewModeLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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