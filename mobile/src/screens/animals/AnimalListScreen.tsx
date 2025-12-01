import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Searchbar,
  Chip,
  IconButton,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../../store';
import { fetchAnimals, deleteAnimal } from '../../store/slices/animalSlice';
import { Animal } from '../../types';
import { RootStackParamList } from '../../navigation';

type AnimalListNavigationProp = StackNavigationProp<RootStackParamList>;

const AnimalListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AnimalListNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { animals, isLoading } = useSelector((state: RootState) => state.animals);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);

  // Filter animals based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAnimals(animals);
    } else {
      const filtered = animals.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAnimals(filtered);
    }
  }, [animals, searchQuery]);

  const loadAnimals = async () => {
    if (user?.farmId) {
      await dispatch(fetchAnimals(user.farmId));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAnimals();
    }, [user?.farmId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals();
    setRefreshing(false);
  };

  const handleDeleteAnimal = (animalId: string, animalName: string) => {
    Alert.alert(
      'Delete Animal',
      `Are you sure you want to delete ${animalName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteAnimal(animalId)),
        },
      ]
    );
  };

  const getHealthStatusColor = (status: Animal['healthStatus']) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'sick':
        return '#f44336';
      case 'treatment':
        return '#FF9800';
      case 'quarantine':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const renderAnimalCard = ({ item }: { item: Animal }) => (
    <Card
      style={styles.animalCard}
      onPress={() => navigation.navigate('AnimalDetail', { animalId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.animalInfo}>
            <Title style={styles.animalName}>{item.name}</Title>
            <Paragraph style={styles.animalDetails}>
              {item.species} • {item.breed}
            </Paragraph>
          </View>
          {user?.role === 'manager' && (
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteAnimal(item.id, item.name)}
            />
          )}
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.statusContainer}>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: getHealthStatusColor(item.healthStatus) }
              ]}
              textStyle={{ color: getHealthStatusColor(item.healthStatus) }}
            >
              {item.healthStatus.charAt(0).toUpperCase() + item.healthStatus.slice(1)}
            </Chip>
            <Text style={styles.weightText}>{item.weight} kg</Text>
          </View>
          
          <Paragraph style={styles.locationText}>
            📍 {item.location}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading && animals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading animals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search animals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {filteredAnimals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No animals found matching your search.' : 'No animals added yet.'}
          </Text>
          {!searchQuery && user?.role === 'manager' && (
            <Text style={styles.emptySubText}>
              Tap the + button to add your first animal.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          renderItem={renderAnimalCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {user?.role === 'manager' && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Add Animal"
          onPress={() => navigation.navigate('AddAnimal')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  animalCard: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  animalDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardContent: {
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: '#fff',
  },
  weightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  locationText: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default AnimalListScreen;