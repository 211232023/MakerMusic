import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';

interface QRCodeAccessProps {
  port?: number;
}

export default function QRCodeAccess({ port = 3000 }: QRCodeAccessProps) {
  const [localIP, setLocalIP] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    detectIP();
  }, []);

  const detectIP = async () => {
    try {
      const ip = await Network.getIpAddressAsync();
      if (ip && ip !== '10.60.16.162') {
        setLocalIP(ip);
        console.log('📱 IP Local detectado:', ip);
      } else {
        setLocalIP('localhost');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao detectar IP:', error);
      setLocalIP('localhost');
    }
  };

  const getExpoUrl = () => {
    if (localIP === 'localhost') {
      return 'exp://localhost:8081';
    }
    return `exp://${localIP}:8081`;
  };

  const getWebUrl = () => {
    if (localIP === 'localhost') {
      return 'http://localhost:8081';
    }
    return `http://${localIP}:8081`;
  };

  const copyToClipboard = async (text: string) => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(text);
        Alert.alert('✓ Copiado!', 'URL copiada para a área de transferência');
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível copiar');
      }
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Erro ao abrir URL:', err);
      Alert.alert('Erro', 'Não foi possível abrir o link');
    });
  };

  if (Platform.OS !== 'web' || !localIP) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Ionicons name={isVisible ? "close-circle" : "qr-code"} size={28} color="#f6e27f" />
        <Text style={styles.toggleText}>
          {isVisible ? 'Fechar' : 'QR Code Expo'}
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.qrContainer}>
          <View style={styles.qrCard}>
            <View style={styles.header}>
              <Ionicons name="phone-portrait" size={24} color="#f6e27f" />
              <Text style={styles.title}>Acesso Mobile (Expo Go)</Text>
            </View>

            <View style={styles.qrWrapper}>
              <QRCode
                value={getExpoUrl()}
                size={200}
                backgroundColor="#fff"
                color="#000"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>📱 Como usar:</Text>
              <Text style={styles.infoText}>1. Abra o app <Text style={styles.bold}>Expo Go</Text> no celular</Text>
              <Text style={styles.infoText}>2. Escaneie o QR Code acima</Text>
              <Text style={styles.infoText}>3. Aguarde o app carregar</Text>
            </View>

            <View style={styles.urlSection}>
              <Text style={styles.urlLabel}>🌐 URL Expo:</Text>
              <TouchableOpacity 
                style={styles.urlBox}
                onPress={() => copyToClipboard(getExpoUrl())}
              >
                <Text style={styles.urlText} numberOfLines={1}>{getExpoUrl()}</Text>
                <Ionicons name="copy-outline" size={20} color="#f6e27f" />
              </TouchableOpacity>
            </View>

            <View style={styles.urlSection}>
              <Text style={styles.urlLabel}>💻 URL Web:</Text>
              <TouchableOpacity 
                style={styles.urlBox}
                onPress={() => copyToClipboard(getWebUrl())}
              >
                <Text style={styles.urlText} numberOfLines={1}>{getWebUrl()}</Text>
                <Ionicons name="copy-outline" size={20} color="#f6e27f" />
              </TouchableOpacity>
            </View>

            <View style={styles.ipSection}>
              <View style={styles.ipIndicator}>
                <View style={[styles.ipDot, { backgroundColor: localIP !== 'localhost' ? '#4CAF50' : '#FF9800' }]} />
                <Text style={styles.ipText}>IP Local: <Text style={styles.ipValue}>{localIP}</Text></Text>
              </View>
              <TouchableOpacity style={styles.refreshButton} onPress={detectIP}>
                <Ionicons name="refresh" size={18} color="#f6e27f" />
                <Text style={styles.refreshText}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {localIP === 'localhost' && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                  Não foi possível detectar o IP da rede local. Certifique-se de estar conectado ao WiFi.
                </Text>
              </View>
            )}

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Dicas:</Text>
              <Text style={styles.tipText}>• O celular deve estar na mesma rede WiFi</Text>
              <Text style={styles.tipText}>• Backend deve estar rodando na porta {port}</Text>
              <Text style={styles.tipText}>• Se o IP mudar, clique em "Atualizar"</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a292e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#f6e27f',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleText: {
    color: '#f6e27f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    position: 'absolute' as any,
    top: 60,
    right: 0,
    width: 350,
  },
  qrCard: {
    backgroundColor: '#2a292e',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#f6e27f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f6e27f',
  },
  qrWrapper: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(246, 226, 127, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    color: '#f6e27f',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#f6e27f',
  },
  urlSection: {
    marginBottom: 12,
  },
  urlLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 6,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    gap: 10,
  },
  urlText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  ipSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  ipIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ipText: {
    color: '#aaa',
    fontSize: 13,
  },
  ipValue: {
    color: '#f6e27f',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1b1f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  refreshText: {
    color: '#f6e27f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },
  warningText: {
    flex: 1,
    color: '#ffb74d',
    fontSize: 12,
  },
  tipsBox: {
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  tipsTitle: {
    color: '#64b5f6',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
});
