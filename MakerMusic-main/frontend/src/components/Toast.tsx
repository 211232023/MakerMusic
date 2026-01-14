import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

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
      <View style={styles.content}>
        <Ionicons name={toastStyle.icon} size={24} color="#fff" style={styles.icon} />
        <Text style={styles.message} numberOfLines={3}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: '5%',
    right: '5%',
    width: '90%',
    alignSelf: 'center',
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
    // Garantir que o toast tenha uma altura mínima e não seja esmagado
    minHeight: 60,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    width: '100%',
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