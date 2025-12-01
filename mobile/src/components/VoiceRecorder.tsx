import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../config/constants';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'App needs access to your microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Microphone permission is required to record audio');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev: number) => prev + 1);
      }, 1000);

      // In a real implementation, you would start the actual recording here
      // For now, we'll simulate it
      console.log('Started recording...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // In a real implementation, you would stop the recording and get the URI
      // For now, we'll simulate it
      const mockUri = `file:///recording_${Date.now()}.m4a`;
      setRecordingUri(mockUri);
      console.log('Stopped recording:', mockUri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      setIsPlaying(true);
      // In a real implementation, you would play the audio here
      console.log('Playing recording:', recordingUri);
      
      // Simulate playback duration
      setTimeout(() => {
        setIsPlaying(false);
      }, recordingDuration * 1000);
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording');
      setIsPlaying(false);
    }
  };

  const stopPlayback = async () => {
    try {
      setIsPlaying(false);
      // In a real implementation, you would stop playback here
      console.log('Stopped playback');
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRecordingUri(null);
            setRecordingDuration(0);
          },
        },
      ]
    );
  };

  const saveRecording = () => {
    if (recordingUri) {
      onRecordingComplete(recordingUri);
      setRecordingUri(null);
      setRecordingDuration(0);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!recordingUri ? (
        // Recording controls
        <View style={styles.recordingControls}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingActive,
              disabled && styles.disabled,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={disabled}
          >
            <Icon
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color={isRecording ? COLORS.error : COLORS.primary}
            />
          </TouchableOpacity>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording... {formatDuration(recordingDuration)}
              </Text>
            </View>
          )}
        </View>
      ) : (
        // Playback controls
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={isPlaying ? stopPlayback : playRecording}
          >
            <Icon
              name={isPlaying ? 'stop' : 'play-arrow'}
              size={32}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={deleteRecording}>
            <Icon name="delete" size={24} color={COLORS.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton]}
            onPress={saveRecording}
          >
            <Icon name="check" size={24} color={COLORS.text.light} />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingActive: {
    borderColor: COLORS.error,
    backgroundColor: '#ffebee',
  },
  disabled: {
    opacity: 0.5,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.xs,
  },
  recordingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: SPACING.sm,
  },
  durationText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  saveButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.light,
    marginLeft: SPACING.xs,
  },
});

export default VoiceRecorder;
