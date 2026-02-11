import React from 'react';
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
}

const SIZES = {
  small: 40,
  medium: 60,
  large: 80,
  xlarge: 120,
};

export default function Logo({ size = 'medium', style }: LogoProps) {
  const logoSize = SIZES[size];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../assets/logo.png')}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Sombra suave
    shadowColor: '#f6e27f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
