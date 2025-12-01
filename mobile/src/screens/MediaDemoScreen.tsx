import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Divider, Button } from 'react-native-paper';
import { MediaCapture, MediaCaptureButton, MediaPreview } from '../components/MediaCapture';
import { MediaItem } from '../services/MediaCaptureService';

const MediaDemoScreen: React.FC = () => {
  const [taskMedia, setTaskMedia] = useState<MediaItem[]>([]);
  const [animalMedia, setAnimalMedia] = useState<MediaItem[]>([]);
  const [cropMedia, setCropMedia] = useState<MediaItem[]>([]);

  const handleTaskMediaAdded = (media: MediaItem) => {
    setTaskMedia(prev => [...prev, media]);
    console.log('Task media added:', media);
  };

  const handleAnimalMediaAdded = (media: MediaItem) => {
    setAnimalMedia(prev => [...prev, media]);
    console.log('Animal media added:', media);
  };

  const handleCropMediaAdded = (media: MediaItem) => {
    setCropMedia(prev => [...prev, media]);
    console.log('Crop media added:', media);
  };

  const handleMediaRemoved = (mediaId: string, type: string) => {
    console.log(`${type} media removed:`, mediaId);
    if (type === 'task') {
      setTaskMedia(prev => prev.filter(item => item.id !== mediaId));
    } else if (type === 'animal') {
      setAnimalMedia(prev => prev.filter(item => item.id !== mediaId));
    } else if (type === 'crop') {
      setCropMedia(prev => prev.filter(item => item.id !== mediaId));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title>Photo/Video Capture Demo</Title>
          <Text style={styles.description}>
            This demo showcases the comprehensive media capture capabilities for farm management tasks.
          </Text>
        </Card.Content>
      </Card>

      {/* Task Completion Media */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title>Task Completion Photos</Title>
          <Text style={styles.sectionDescription}>
            Capture photos to document task completion with automatic metadata.
          </Text>
          
          <MediaCapture
            onMediaAdded={handleTaskMediaAdded}
            onMediaRemoved={(mediaId) => handleMediaRemoved(mediaId, 'task')}
            initialMedia={taskMedia}
            maxItems={3}
            allowedTypes="photo"
            showPreview={true}
            captureOptions={{
              quality: 0.8,
              maxWidth: 1024,
              maxHeight: 1024,
            }}
          />
        </Card.Content>
      </Card>

      {/* Animal Health Media */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title>Animal Health Documentation</Title>
          <Text style={styles.sectionDescription}>
            Record photos and videos for animal health monitoring and veterinary records.
          </Text>
          
          <MediaCapture
            onMediaAdded={handleAnimalMediaAdded}
            onMediaRemoved={(mediaId) => handleMediaRemoved(mediaId, 'animal')}
            initialMedia={animalMedia}
            maxItems={5}
            allowedTypes="both"
            showPreview={true}
            captureOptions={{
              quality: 0.9,
              maxWidth: 1200,
              maxHeight: 1200,
            }}
          />
        </Card.Content>
      </Card>

      {/* Crop Monitoring Media */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title>Crop Monitoring Videos</Title>
          <Text style={styles.sectionDescription}>
            Document crop growth, pest issues, and harvest progress with time-lapse videos.
          </Text>
          
          <MediaCapture
            onMediaAdded={handleCropMediaAdded}
            onMediaRemoved={(mediaId) => handleMediaRemoved(mediaId, 'crop')}
            initialMedia={cropMedia}
            maxItems={2}
            allowedTypes="video"
            showPreview={true}
            captureOptions={{
              videoQuality: 'high',
              durationLimit: 60,
            }}
          />
        </Card.Content>
      </Card>

      {/* Quick Capture Buttons */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title>Quick Capture Buttons</Title>
          <Text style={styles.sectionDescription}>
            Use floating action buttons for quick photo/video capture during field work.
          </Text>
          
          <View style={styles.buttonContainer}>
            <MediaCaptureButton
              onMediaAdded={(media) => console.log('Quick photo captured:', media)}
              captureOptions={{ mediaType: 'photo' }}
              title="Quick Photo"
              icon="camera"
            />
            
            <MediaCaptureButton
              onMediaAdded={(media) => console.log('Quick video captured:', media)}
              captureOptions={{ mediaType: 'video', durationLimit: 30 }}
              title="Quick Video"
              icon="videocam"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Features Summary */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title>Key Features</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>📸 Photo & Video Capture</Text>
            <Text style={styles.featureItem}>☁️ Automatic Cloud Upload</Text>
            <Text style={styles.featureItem}>📱 Offline Storage & Sync</Text>
            <Text style={styles.featureItem}>🔍 Image Compression & Optimization</Text>
            <Text style={styles.featureItem}>📍 GPS Location Metadata</Text>
            <Text style={styles.featureItem}>🏷️ Task/Animal/Crop Tagging</Text>
            <Text style={styles.featureItem}>🔄 Background Upload Queue</Text>
            <Text style={styles.featureItem}>📊 Upload Progress Tracking</Text>
          </View>

          <Button
            mode="outlined"
            onPress={() => console.log('Sync all pending uploads')}
            style={styles.syncButton}
          >
            Sync All Pending Media
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  divider: {
    marginVertical: 16,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  syncButton: {
    marginTop: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default MediaDemoScreen;