import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Text, Button, IconButton, Chip, Surface, ProgressBar, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MediaCaptureService, { MediaItem, CaptureOptions } from '../services/MediaCaptureService';

interface MediaCaptureProps {
  onMediaAdded?: (media: MediaItem) => void;
  onMediaRemoved?: (mediaId: string) => void;
  initialMedia?: MediaItem[];
  maxItems?: number;
  allowedTypes?: 'photo' | 'video' | 'both';
  showPreview?: boolean;
  captureOptions?: CaptureOptions;
  style?: any;
}

interface MediaGridProps {
  media: MediaItem[];
  onRemove: (mediaId: string) => void;
  showRemoveButton?: boolean;
}

const MediaGrid: React.FC<MediaGridProps> = ({ media, onRemove, showRemoveButton = true }) => {
  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.mediaContainer}>
      <Surface style={styles.mediaSurface} elevation={2}>
        {item.type === 'photo' ? (
          <Image source={{ uri: item.uri }} style={styles.mediaImage} />
        ) : (
          <View style={styles.videoContainer}>
            <Image source={{ uri: item.uri }} style={styles.mediaImage} />
            <View style={styles.videoOverlay}>
              <Icon name="play-circle-filled" size={40} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        )}
        
        {showRemoveButton && (
          <IconButton
            icon="close"
            size={16}
            iconColor="#fff"
            containerColor="rgba(0,0,0,0.6)"
            style={styles.removeButton}
            onPress={() => onRemove(item.id)}
          />
        )}
        
        <View style={styles.mediaInfo}>
          <Chip
            mode="flat"
            compact
            textStyle={styles.chipText}
            style={[
              styles.typeChip,
              { backgroundColor: item.type === 'photo' ? '#4CAF50' : '#FF9800' }
            ]}
          >
            {item.type === 'photo' ? 'Photo' : 'Video'}
          </Chip>
          
          {!item.isUploaded && (
            <Chip
              mode="flat"
              compact
              textStyle={styles.chipText}
              style={[styles.statusChip, { backgroundColor: '#2196F3' }]}
            >
              Pending
            </Chip>
          )}
        </View>
      </Surface>
    </View>
  );

  if (media.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={media}
      renderItem={renderMediaItem}
      numColumns={2}
      keyExtractor={(item) => item.id}
      style={styles.mediaGrid}
      contentContainerStyle={styles.mediaGridContent}
    />
  );
};

export const MediaCapture: React.FC<MediaCaptureProps> = ({
  onMediaAdded,
  onMediaRemoved,
  initialMedia = [],
  maxItems = 10,
  allowedTypes = 'both',
  showPreview = true,
  captureOptions = {},
  style,
}) => {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getMediaType = (): 'photo' | 'video' | 'mixed' => {
    switch (allowedTypes) {
      case 'photo': return 'photo';
      case 'video': return 'video';
      case 'both': return 'mixed';
      default: return 'mixed';
    }
  };

  const handleMediaCapture = () => {
    if (media.length >= maxItems) {
      return;
    }

    const options: CaptureOptions = {
      mediaType: getMediaType(),
      ...captureOptions,
    };

    MediaCaptureService.showMediaSelector(
      'Add Media',
      options,
      (newMedia: MediaItem) => {
        const updatedMedia = [...media, newMedia];
        setMedia(updatedMedia);
        onMediaAdded?.(newMedia);
      },
      (error: string) => {
        console.error('Media capture error:', error);
      }
    );
  };

  const handleMediaRemove = async (mediaId: string) => {
    try {
      await MediaCaptureService.deleteMedia(mediaId);
      const updatedMedia = media.filter(item => item.id !== mediaId);
      setMedia(updatedMedia);
      onMediaRemoved?.(mediaId);
    } catch (error) {
      console.error('Error removing media:', error);
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    try {
      const userId = 'current_user'; // Replace with actual user ID
      await MediaCaptureService.syncPendingUploads(userId);
      
      // Refresh media to update upload status
      const updatedMediaItems = await Promise.all(
        media.map(async (item) => {
          const updatedItem = await MediaCaptureService.getMediaById(item.id);
          return updatedItem || item;
        })
      );
      
      setMedia(updatedMediaItems);
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const canAddMore = media.length < maxItems;
  const hasPendingUploads = media.some(item => !item.isUploaded);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Media ({media.length}/{maxItems})</Text>
        
        {hasPendingUploads && (
          <Button
            mode="outlined"
            onPress={handleUploadAll}
            loading={isUploading}
            disabled={isUploading}
            compact
          >
            Upload All
          </Button>
        )}
      </View>

      {isUploading && (
        <View style={styles.uploadProgress}>
          <Text style={styles.uploadText}>Uploading media...</Text>
          <ProgressBar indeterminate color="#4CAF50" />
        </View>
      )}

      {showPreview && (
        <MediaGrid
          media={media}
          onRemove={handleMediaRemove}
          showRemoveButton={true}
        />
      )}

      {canAddMore && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleMediaCapture}
          activeOpacity={0.7}
        >
          <Icon name="add-a-photo" size={32} color="#666" />
          <Text style={styles.addButtonText}>
            Add {allowedTypes === 'both' ? 'Photo/Video' : allowedTypes === 'photo' ? 'Photo' : 'Video'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const MediaCaptureButton: React.FC<{
  onMediaAdded: (media: MediaItem) => void;
  captureOptions?: CaptureOptions;
  title?: string;
  icon?: string;
}> = ({ onMediaAdded, captureOptions = {}, title = 'Add Media', icon = 'add-a-photo' }) => {
  const handleCapture = () => {
    MediaCaptureService.showMediaSelector(
      title,
      captureOptions,
      onMediaAdded,
      (error: string) => {
        console.error('Media capture error:', error);
      }
    );
  };

  return (
    <FAB
      icon={icon}
      onPress={handleCapture}
      style={styles.fab}
    />
  );
};

export const MediaPreview: React.FC<{
  media: MediaItem[];
  onRemove?: (mediaId: string) => void;
  showRemoveButton?: boolean;
}> = ({ media, onRemove, showRemoveButton = false }) => {
  const handleRemove = async (mediaId: string) => {
    if (onRemove) {
      onRemove(mediaId);
    } else {
      await MediaCaptureService.deleteMedia(mediaId);
    }
  };

  return (
    <MediaGrid
      media={media}
      onRemove={handleRemove}
      showRemoveButton={showRemoveButton}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  uploadProgress: {
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    marginTop: 8,
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mediaGrid: {
    flexGrow: 0,
  },
  mediaGridContent: {
    paddingBottom: 8,
  },
  mediaContainer: {
    flex: 1,
    margin: 4,
    maxWidth: '48%',
  },
  mediaSurface: {
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    margin: 0,
  },
  mediaInfo: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    gap: 4,
  },
  typeChip: {
    height: 20,
  },
  statusChip: {
    height: 20,
  },
  chipText: {
    fontSize: 10,
    color: '#fff',
  },
  fab: {
    backgroundColor: '#4CAF50',
  },
});

export default MediaCapture;