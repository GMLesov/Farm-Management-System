import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

interface AnimalPhoto {
  id: string;
  uri: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  synced: boolean;
}

interface Animal {
  _id?: string;
  localId: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  healthStatus: string;
  photos: AnimalPhoto[];
  location?: {
    latitude: number;
    longitude: number;
  };
  farmId?: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MobileAnimalManagementScreen: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadAnimals();
    
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected || false);
      if (state.isConnected) {
        syncPendingData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      // Load from local storage first (offline-first)
      const localData = await AsyncStorage.getItem('animals');
      if (localData) {
        setAnimals(JSON.parse(localData));
      }

      // Try to fetch from server if online
      if (isOnline) {
        try {
          const token = await AsyncStorage.getItem('auth_token');
          const response = await axios.get('/api/animals', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const serverAnimals = response.data.data.map((a: any) => ({
            ...a,
            localId: a._id,
            synced: true,
          }));
          
          setAnimals(serverAnimals);
          await AsyncStorage.setItem('animals', JSON.stringify(serverAnimals));
        } catch (error) {
          console.error('Error fetching from server:', error);
        }
      }
    } catch (error) {
      console.error('Error loading animals:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnimals().finally(() => setRefreshing(false));
  }, []);

  const capturePhoto = async (animalId: string) => {
    try {
      // Get current location
      const location = await new Promise<{latitude: number; longitude: number}>((resolve) => {
        Geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Location error:', error);
            resolve({ latitude: 0, longitude: 0 });
          }
        );
      });

      // Launch camera
      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: true,
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const photo: AnimalPhoto = {
          id: `photo_${Date.now()}`,
          uri: asset.uri || '',
          timestamp: new Date().toISOString(),
          location,
          synced: false,
        };

        // Update animal with new photo
        const updatedAnimals = animals.map(animal => {
          if (animal.localId === animalId) {
            return {
              ...animal,
              photos: [...animal.photos, photo],
              synced: false,
              updatedAt: new Date().toISOString(),
            };
          }
          return animal;
        });

        setAnimals(updatedAnimals);
        await AsyncStorage.setItem('animals', JSON.stringify(updatedAnimals));

        // Try to sync immediately if online
        if (isOnline) {
          await syncAnimalPhoto(animalId, photo);
        }
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const syncAnimalPhoto = async (animalId: string, photo: AnimalPhoto) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      // Upload photo to server
      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `animal_${animalId}_${photo.id}.jpg`,
      } as any);
      
      if (photo.location) {
        formData.append('latitude', photo.location.latitude.toString());
        formData.append('longitude', photo.location.longitude.toString());
      }

      await axios.post(`/api/animals/${animalId}/photos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mark photo as synced
      const updatedAnimals = animals.map(animal => {
        if (animal.localId === animalId) {
          return {
            ...animal,
            photos: animal.photos.map(p => 
              p.id === photo.id ? { ...p, synced: true } : p
            ),
            synced: true,
          };
        }
        return animal;
      });

      setAnimals(updatedAnimals);
      await AsyncStorage.setItem('animals', JSON.stringify(updatedAnimals));
    } catch (error) {
      console.error('Error syncing photo:', error);
    }
  };

  const syncPendingData = async () => {
    try {
      const pendingAnimals = animals.filter(a => !a.synced);
      
      for (const animal of pendingAnimals) {
        // Sync animal data
        const token = await AsyncStorage.getItem('auth_token');
        
        if (!animal._id) {
          // Create new animal
          const response = await axios.post('/api/animals', {
            name: animal.name,
            type: animal.type,
            breed: animal.breed,
            age: animal.age,
            weight: animal.weight,
            healthStatus: animal.healthStatus,
            location: animal.location,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          animal._id = response.data.data._id;
        }

        // Sync photos
        const pendingPhotos = animal.photos.filter(p => !p.synced);
        for (const photo of pendingPhotos) {
          await syncAnimalPhoto(animal.localId, photo);
        }
      }

      // Reload data
      await loadAnimals();
    } catch (error) {
      console.error('Error syncing pending data:', error);
    }
  };

  const addAnimal = async () => {
    // Get current location
    const location = await new Promise<{latitude: number; longitude: number}>((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          resolve({ latitude: 0, longitude: 0 });
        }
      );
    });

    const newAnimal: Animal = {
      localId: `local_${Date.now()}`,
      name: `Animal ${animals.length + 1}`,
      type: 'cattle',
      healthStatus: 'healthy',
      photos: [],
      location,
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedAnimals = [...animals, newAnimal];
    setAnimals(updatedAnimals);
    await AsyncStorage.setItem('animals', JSON.stringify(updatedAnimals));

    // Try to sync immediately if online
    if (isOnline) {
      await syncPendingData();
    }
  };

  const renderAnimal = ({ item }: { item: Animal }) => (
    <View style={styles.animalCard}>
      <View style={styles.animalHeader}>
        <Text style={styles.animalName}>{item.name}</Text>
        <View style={[styles.syncBadge, item.synced ? styles.synced : styles.pending]}>
          <Text style={styles.syncText}>{item.synced ? '✓ Synced' : '⟳ Pending'}</Text>
        </View>
      </View>
      
      <Text style={styles.animalType}>{item.type} - {item.healthStatus}</Text>
      
      {item.location && (
        <Text style={styles.location}>
          📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
        </Text>
      )}

      <View style={styles.photoContainer}>
        {item.photos.slice(0, 3).map((photo) => (
          <View key={photo.id} style={styles.photoWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            {!photo.synced && (
              <View style={styles.unsyncedBadge}>
                <Text style={styles.unsyncedText}>⟳</Text>
              </View>
            )}
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={() => capturePhoto(item.localId)}
        >
          <Text style={styles.addPhotoText}>📷 Add Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Animal Management</Text>
        <View style={[styles.statusBadge, isOnline ? styles.online : styles.offline]}>
          <Text style={styles.statusText}>{isOnline ? '● Online' : '○ Offline'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addAnimal}>
        <Text style={styles.addButtonText}>+ Add Animal</Text>
      </TouchableOpacity>

      <FlatList
        data={animals}
        renderItem={renderAnimal}
        keyExtractor={(item) => item.localId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  online: {
    backgroundColor: '#e8f5e9',
  },
  offline: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  synced: {
    backgroundColor: '#e8f5e9',
  },
  pending: {
    backgroundColor: '#fff3e0',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  animalType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  unsyncedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsyncedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 10,
    color: '#4CAF50',
    textAlign: 'center',
  },
});
