import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Text, Platform, Dimensions } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  url: string;
  fileName?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoPlayer({ url, fileName }: VideoPlayerProps) {
  const [status, setStatus] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  // Configuração de áudio global para garantir que o som saia mesmo no modo silencioso (iOS)
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (e) {}
  };

  const handleOpenPlayer = () => {
    setupAudio();
    setModalVisible(true);
    setError(null);
  };

  const onError = (errorMessage: string) => {
    console.log('Video Error Details:', errorMessage);
    setError(errorMessage);
  };

  return (
    <View style={styles.container}>
      {/* Miniatura / Botão de Play no Chat */}
      <TouchableOpacity 
        style={styles.previewContainer} 
        onPress={handleOpenPlayer}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="videocam" size={30} color="rgba(212, 175, 55, 0.5)" />
          <View style={styles.playIconOverlay}>
            <Ionicons name="play-circle" size={50} color="#d4af37" />
          </View>
        </View>
        <Text style={styles.previewText} numberOfLines={1}>{fileName || 'Vídeo'}</Text>
      </TouchableOpacity>

      {/* Player em Tela Cheia (Modal) */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header do Player */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.fileNameText} numberOfLines={1}>
              {fileName || 'Reproduzindo Vídeo'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Área do Vídeo */}
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ 
                uri: url,
                // Headers vazios às vezes ajudam o motor do Android a tratar como stream
                headers: {} 
              }}
              style={styles.fullVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              onPlaybackStatusUpdate={s => {
                setStatus(s);
                if (s.isLoaded) setIsLoaded(true);
              }}
              onError={onError}
            />

            {/* Loading Indicator */}
            {(!isLoaded && !error) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#d4af37" />
                <Text style={styles.loadingText}>Carregando vídeo...</Text>
              </View>
            )}

            {/* Mensagem de Erro Interna (Sem abrir navegador) */}
            {error && (
              <View style={styles.errorOverlay}>
                <Ionicons name="alert-circle" size={60} color="#ff4444" />
                <Text style={styles.errorTitle}>Erro de Reprodução</Text>
                <Text style={styles.errorSubtitle}>
                  O formato deste vídeo pode não ser compatível com o seu dispositivo ou a conexão foi interrompida.
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => {
                    setError(null);
                    setIsLoaded(false);
                    videoRef.current?.loadAsync({ uri: url }, {}, true);
                  }}
                >
                  <Text style={styles.retryText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  previewContainer: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  previewText: {
    color: '#aaa',
    fontSize: 12,
    padding: 5,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  closeButton: {
    padding: 5,
  },
  fileNameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#d4af37',
    marginTop: 10,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  errorSubtitle: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 25,
    backgroundColor: '#d4af37',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: '#000',
    fontWeight: 'bold',
  }
});