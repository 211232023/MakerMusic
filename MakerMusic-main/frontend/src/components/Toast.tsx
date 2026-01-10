import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  visible, 
  onHide, 
  duration = 3000 
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide após duração
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#4CAF50', icon: 'checkmark-circle' as const };
      case 'error':
        return { backgroundColor: '#F44336', icon: 'close-circle' as const };
      case 'warning':
        return { backgroundColor: '#FF9800', icon: 'warning' as const };
      case 'info':
        return { backgroundColor: '#2196F3', icon: 'information-circle' as const };
      default:
        return { backgroundColor: '#323232', icon: 'information-circle' as const };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: toastStyle.backgroundColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={toastStyle.icon} size={24} color="#fff" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 9999,
    maxWidth: Dimensions.get('window').width - 40,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default Toast;