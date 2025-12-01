import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import { MediaCapture, MediaCaptureButton } from '../components/MediaCapture';
import { MediaItem } from '../services/MediaCaptureService';

const MediaTestScreen: React.FC = () => {
  const [testMedia, setTestMedia] = useState<MediaItem[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

  const handleMediaAdded = (media: MediaItem) => {
    setTestMedia(prev => [...prev, media]);
    setLastAction(`Added: ${media.type} - ${media.fileName}`);
    console.log('Media added:', media);
  };

  const handleMediaRemoved = (mediaId: string) => {
    const removedItem = testMedia.find(item => item.id === mediaId);
    setTestMedia(prev => prev.filter(item => item.id !== mediaId));
    setLastAction(`Removed: ${removedItem?.fileName || 'Unknown'}`);
    console.log('Media removed:', mediaId);
  };

  const clearAllMedia = () => {
    setTestMedia([]);
    setLastAction('Cleared all media');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>📷 Media Capture Test</Text>
          <Text style={styles.subtitle}>
            Test the photo/video capture functionality
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content>
          <Text style={styles.statusTitle}>Status</Text>
          <Chip mode="outlined" style={styles.statusChip}>
            {testMedia.length} media items captured
          </Chip>
          {lastAction && (
            <Text style={styles.lastAction}>Last action: {lastAction}</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.captureCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Media Capture Component</Text>
          <MediaCapture
            onMediaAdded={handleMediaAdded}
            onMediaRemoved={handleMediaRemoved}
            initialMedia={testMedia}
            maxItems={5}
            allowedTypes="both"
            showPreview={true}
            captureOptions={{
              quality: 0.8,
              maxWidth: 1024,
              maxHeight: 1024,
              durationLimit: 30,
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.quickCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Capture Buttons</Text>
          <View style={styles.buttonRow}>
            <MediaCaptureButton
              onMediaAdded={handleMediaAdded}
              captureOptions={{ mediaType: 'photo' }}
              title="Quick Photo"
              icon="camera"
            />
            <MediaCaptureButton
              onMediaAdded={handleMediaAdded}
              captureOptions={{ mediaType: 'video', durationLimit: 15 }}
              title="Quick Video"
              icon="videocam"
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.controlsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Test Controls</Text>
          <Button
            mode="outlined"
            onPress={clearAllMedia}
            disabled={testMedia.length === 0}
            style={styles.clearButton}
          >
            Clear All Media ({testMedia.length})
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Features Being Tested</Text>
          <Text style={styles.featureText}>✅ Photo capture from camera</Text>
          <Text style={styles.featureText}>✅ Photo selection from gallery</Text>
          <Text style={styles.featureText}>✅ Video recording with time limits</Text>
          <Text style={styles.featureText}>✅ Media preview with thumbnails</Text>
          <Text style={styles.featureText}>✅ Local storage and metadata</Text>
          <Text style={styles.featureText}>✅ Upload queue management</Text>
          <Text style={styles.featureText}>✅ Automatic Firebase sync</Text>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statusCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  lastAction: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  captureCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  quickCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  controlsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  bottomSpace: {
    height: 32,
  },
});

export default MediaTestScreen;