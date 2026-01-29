import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    if (!recording) return;

    setIsRecording(false);
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    if (uri) {
      onRecordingComplete(uri, duration);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <View style={styles.recordingInfo}>
          <View style={styles.dot} />
          <Text style={styles.timerText}>{formatTime(duration)}</Text>
          <TouchableOpacity onPress={stopRecording} style={styles.stopButton}>
            <Ionicons name="stop" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={startRecording} style={styles.recordButton}>
          <Ionicons name="mic" size={24} color="#d4af37" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordButton: {
    padding: 10,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a292e',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: -200, // Ajuste conforme necessário para cobrir o input
    zIndex: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4444',
    marginRight: 10,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  stopButton: {
    padding: 5,
  },
});