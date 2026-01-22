import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
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
  placeholder = 'Selecione...',
  style,
  containerStyle,
}: CustomPickerProps) {
  
  // Para Web, usamos um select HTML nativo
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

  // Para Mobile (iOS/Android), usamos o Picker nativo
  return (
    <View style={[styles.mobileContainer, containerStyle]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, style]}
        dropdownIconColor="#d4af37"
        itemStyle={{ color: '#fff' }}
      >
        {items.map((item, index) => (
          <Picker.Item
            key={index}
            label={item.label}
            value={item.value}
            color={item.color || '#fff'}
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
  },
  picker: {
    color: '#fff',
    height: 60,
  },
});
