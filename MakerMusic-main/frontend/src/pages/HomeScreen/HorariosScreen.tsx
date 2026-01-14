import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../src/UserContext';
import { getMySchedules } from '../../services/api';

export default function HorariosScreen() {
  const navigation = useNavigation();
  const { token } = useUser();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    if (token) {
      try {
        setIsLoading(true);
        const data = await getMySchedules(token);
        if (Array.isArray(data)) { setSchedules(data); }
      } finally { setIsLoading(false); }
    }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchSchedules(); }, [fetchSchedules]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Horários</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#d4af37" />
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.dayText}>{item.day_of_week}</Text>
              <Text style={styles.timeText}>{`${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}`}</Text>
              <Text style={styles.teacherText}>Professor: {item.teacher_name}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não tem horários definidos.</Text>}
        />
      )}
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
    width: '100%' 
  },
  title: { 
    fontSize: 28,
    fontWeight: 'bold', 
    color: '#f6e27f', 
    marginBottom: 30, 
    marginTop: 40, 
    textAlign: 'center' 
  },
  scheduleItem: { 
    backgroundColor: '#333', 
    padding: 20, 
    borderRadius: 10, 
    marginBottom: 15,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center'
  },
  dayText: { 
    color: '#f6e27f', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textTransform: 'capitalize' 
  },
  timeText: { 
    color: '#fff', 
    fontSize: 18, 
    marginVertical: 5 
  },
  teacherText: { 
    color: '#ccc', 
    fontSize: 16 
  },
  emptyText: { 
    color: '#aaa', 
    fontStyle: 'italic', 
    textAlign: 'center', 
    marginTop: 50 
  },
  backButton: { 
    position: 'absolute', 
    bottom: 50, 
    alignSelf: 'center' 
  },
  backButtonText: { 
    color: '#d4af37', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
