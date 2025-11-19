import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleRecoverPassword = () => {
    // TODO: chamada para sua API de recuperação de senha
    console.log('Recuperar senha para:', email);
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>Recuperar senha</Text>

      <TextInput
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity onPress={handleRecoverPassword}>
        <Text>Enviar link de recuperação</Text>
      </TouchableOpacity>
    </View>
  );
}