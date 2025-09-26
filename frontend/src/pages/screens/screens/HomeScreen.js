import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen({ userType }) {
  const navigation = useNavigation();

  const handleNavigate = (screen) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screen);
      console.log(`Acessando ${screen}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MakerMusic</Text>

      {/* Botões para Admin */}
      {userType === 'admin' && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('EntitiesScreen')}
          >
            <Text style={styles.buttonText}>Gerenciar Usuários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Horarios')}
          >
            <Text style={styles.buttonText}>Gerenciar Horários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Financeiro')}
          >
            <Text style={styles.buttonText}>Controle de Pagamentos</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Botões para Professor */}
      {userType === 'professor' && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Horarios')}
          >
            <Text style={styles.buttonText}>Horários e Sala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('AnotarPresenca')}
          >
            <Text style={styles.buttonText}>Anotar Presença</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Tarefas')}
          >
            <Text style={styles.buttonText}>Tarefas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Estudantes')}
          >
            <Text style={styles.buttonText}>Estudantes</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Botões para Aluno */}
      {userType === 'aluno' && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Horarios')}
          >
            <Text style={styles.buttonText}>Horários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Chat')}
          >
            <Text style={styles.buttonText}>Chat com o Professor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Financeiro')}
          >
            <Text style={styles.buttonText}>Financeiro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('Tarefas')}
          >
            <Text style={styles.buttonText}>Tarefas</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f6e27f',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#d4af37',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#1c1b1f',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
