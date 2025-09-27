import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllUsers, assignTeacher } from '../../services/api';
import { User } from '../src/UserContext'; // Reutilizamos o tipo User

export default function ManageUsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const userList = await getAllUsers();
      setUsers(userList);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  // Usamos useMemo para separar os utilizadores em listas de alunos e professores
  // de forma eficiente, sem ter de recalcular a cada renderização.
  const { students, teachers } = useMemo(() => {
    const students = users.filter(u => u.role === 'ALUNO');
    const teachers = users.filter(u => u.role === 'PROFESSOR');
    return { students, teachers };
  }, [users]);

  const handleAssign = async () => {
    if (!selectedStudent || !selectedTeacher) {
      Alert.alert('Seleção Incompleta', 'Por favor, selecione um aluno e um professor.');
      return;
    }
    setIsAssigning(true);
    const response = await assignTeacher(selectedStudent.id, selectedTeacher.id);
    setIsAssigning(false);

    if (response.message.includes('sucesso')) {
      Alert.alert('Sucesso!', `O professor ${selectedTeacher.name} foi associado ao aluno ${selectedStudent.name}.`);
      setSelectedStudent(null);
      setSelectedTeacher(null);
    } else {
      Alert.alert('Erro', response.message || 'Não foi possível fazer a associação.');
    }
  };

  if (isLoading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#d4af37" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Associar Aluno a Professor</Text>

      <View style={styles.column}>
        <Text style={styles.listTitle}>Alunos</Text>
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, selectedStudent?.id === item.id && styles.selectedItem]}
              onPress={() => setSelectedStudent(item)}
            >
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.column}>
        <Text style={styles.listTitle}>Professores</Text>
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, selectedTeacher?.id === item.id && styles.selectedItem]}
              onPress={() => setSelectedTeacher(item)}
            >
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isAssigning ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ height: 50 }}/>
      ) : (
        <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
          <Text style={styles.assignButtonText}>Associar</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1c1b1f', padding: 20, paddingTop: 60 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1b1f' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#f6e27f', textAlign: 'center', marginBottom: 20 },
    column: { flex: 1, marginBottom: 10 },
    listTitle: { fontSize: 18, color: '#fff', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 5 },
    item: { padding: 15, backgroundColor: '#333', borderRadius: 5, marginBottom: 5 },
    selectedItem: { backgroundColor: '#d4af37' },
    itemText: { color: '#fff' },
    assignButton: { backgroundColor: '#d4af37', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 10, height: 50 },
    assignButtonText: { color: '#1c1b1f', fontWeight: 'bold', fontSize: 16 },
    backText: { color: '#d4af37', textAlign: 'center', marginTop: 10 }
});