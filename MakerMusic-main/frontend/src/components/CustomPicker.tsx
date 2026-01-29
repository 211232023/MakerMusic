import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CustomPickerProps {
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  items: Array<{ label: string; value: string | null; color?: string }>;
  placeholder?: string;
  style?: any;
  containerStyle?: any;
}

export default function CustomPicker({
  selectedValue,
  onValueChange,
  items,
  style,
  containerStyle,
}: CustomPickerProps) {
  
  // 1. VERSÃO WEB
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, containerStyle]}>
        <select
          value={selectedValue || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? null : e.target.value;
            onValueChange(value);
          }}
          style={{
            width: '100%',
            height: 60,
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '0 15px',
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            ...style,
          }}
        >
          {items.map((item, index) => (
            <option
              key={index}
              value={item.value || ''}
              style={{
                backgroundColor: '#333',
                color: item.color || '#fff',
              }}
            >
              {item.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  // 2. VERSÃO MOBILE (iOS e Android)
  return (
    <View style={[
      styles.mobileContainer, 
      Platform.OS === 'ios' ? styles.iosContainer : styles.androidContainer,
      containerStyle
    ]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[
          styles.picker, 
          Platform.OS === 'ios' ? styles.iosPicker : styles.androidPicker,
          style
        ]}
        dropdownIconColor="#d4af37"
        mode={Platform.OS === 'android' ? "dropdown" : undefined}
        // No iOS, o itemStyle é essencial para a visibilidade do texto na roda
        itemStyle={Platform.OS === 'ios' ? { color: '#fff', fontSize: 18, height: 120 } : undefined}
      >
        {items.map((item, index) => (
          <Picker.Item
            key={index}
            label={item.label}
            value={item.value}
            // No Android, usamos cor escura para o dropdown branco nativo
            // No iOS, a cor é controlada pelo itemStyle acima
            color={Platform.OS === 'android' ? '#333' : '#fff'}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 20,
  },
  mobileContainer: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  androidContainer: {
    height: 60,
    justifyContent: 'center',
  },
  iosContainer: {
    // No iOS, o Picker nativo é uma roda, então precisa de mais altura
    height: 120, 
    justifyContent: 'center',
    backgroundColor: '#2a2a2a', // Um pouco mais claro para destacar no fundo preto
  },
  picker: {
    width: '100%',
  },
  androidPicker: {
    color: '#fff',
    height: 60,
  },
  iosPicker: {
    // Estilos específicos para a roda do iOS
    height: 120,
    color: '#fff',
  },
});