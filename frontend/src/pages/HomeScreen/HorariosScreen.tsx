import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Importe os tipos do ficheiro central
import { RootStackParamList } from '../src/types/navigation'; 

// Crie um tipo para os dados de exemplo
type Schedule = {
  id: string;
  materia: string;
  professor: string;
  dia: string;
  horario: string;
};

const DUMMY_SCHEDULES: Schedule[] = [
  { id: '1', materia: 'Violão', professor: 'Carlos', dia: 'Segunda-feira', horario: '14:00 - 15:00' },
  { id: '2', materia: 'Piano', professor: 'Ana', dia: 'Terça-feira', horario: '10:00 - 11:00' },
  { id: '3', materia: 'Canto', professor: 'Mariana', dia: 'Quarta-feira', horario: '16:00 - 17:00' },
];

// Use o tipo do nosso ficheiro de navegação para a propriedade de navegação
type HorariosScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HorariosScreen'>;

// O componente agora não precisa de receber "props" diretamente,
// pois usamos o hook "useNavigation"
export default function HorariosScreen() {
  const navigation = useNavigation<HorariosScreenNavigationProp>();

  const renderItem = ({ item }: { item: Schedule }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.itemMateria}>{item.materia}</Text>
      <Text style={styles.itemDetails}>{item.professor} - {item.dia} às {item.horario}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Horários</Text>
      <FlatList
        data={DUMMY_SCHEDULES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1b1f',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 30,
    marginTop: 40,
  },
  list: {
    width: '100%',
  },
  scheduleItem: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  itemMateria: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemDetails: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#d4af37',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#1c1b1f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});