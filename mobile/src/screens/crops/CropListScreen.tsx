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
  ProgressBar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../../store';
import { fetchCrops, deleteCrop } from '../../store/slices/cropSlice';
import { Crop } from '../../types';
import { RootStackParamList } from '../../navigation';

type CropListNavigationProp = StackNavigationProp<RootStackParamList>;

const CropListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CropListNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { crops, isLoading } = useSelector((state: RootState) => state.crops);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);

  // Filter crops based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCrops(crops);
    } else {
      const filtered = crops.filter(crop =>
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.fieldLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.stage.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCrops(filtered);
    }
  }, [crops, searchQuery]);

  const loadCrops = async () => {
    if (user?.farmId) {
      await dispatch(fetchCrops(user.farmId));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCrops();
    }, [user?.farmId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCrops();
    setRefreshing(false);
  };

  const handleDeleteCrop = (cropId: string, cropName: string) => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to delete ${cropName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteCrop(cropId)),
        },
      ]
    );
  };

  const getStageColor = (stage: Crop['stage']) => {
    switch (stage) {
      case 'planted':
        return '#8BC34A';
      case 'growing':
        return '#4CAF50';
      case 'flowering':
        return '#FF9800';
      case 'fruiting':
        return '#FF5722';
      case 'harvested':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getStageProgress = (stage: Crop['stage']) => {
    switch (stage) {
      case 'planted':
        return 0.2;
      case 'growing':
        return 0.4;
      case 'flowering':
        return 0.6;
      case 'fruiting':
        return 0.8;
      case 'harvested':
        return 1.0;
      default:
        return 0;
    }
  };

  const calculateDaysFromPlanting = (plantingDate: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - plantingDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilHarvest = (expectedHarvestDate: Date) => {
    const now = new Date();
    const diffTime = expectedHarvestDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const renderCropCard = ({ item }: { item: Crop }) => {
    const daysFromPlanting = calculateDaysFromPlanting(new Date(item.plantingDate));
    const daysUntilHarvest = getDaysUntilHarvest(new Date(item.expectedHarvestDate));
    
    return (
      <Card
        style={styles.cropCard}
        onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cropInfo}>
              <Title style={styles.cropName}>{item.name}</Title>
              <Paragraph style={styles.cropDetails}>
                {item.variety} • {item.area} hectares
              </Paragraph>
            </View>
            {user?.role === 'manager' && (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteCrop(item.id, item.name)}
              />
            )}
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Growth Progress</Text>
              <Chip
                mode="outlined"
                style={[
                  styles.stageChip,
                  { borderColor: getStageColor(item.stage) }
                ]}
                textStyle={{ color: getStageColor(item.stage) }}
              >
                {item.stage.charAt(0).toUpperCase() + item.stage.slice(1)}
              </Chip>
            </View>
            <ProgressBar
              progress={getStageProgress(item.stage)}
              color={getStageColor(item.stage)}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Days Planted</Text>
                <Text style={styles.timeValue}>{daysFromPlanting}</Text>
              </View>
              {item.stage !== 'harvested' && (
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Days to Harvest</Text>
                  <Text style={styles.timeValue}>{daysUntilHarvest}</Text>
                </View>
              )}
              {item.harvestYield && (
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Yield</Text>
                  <Text style={styles.yieldValue}>{item.harvestYield} tons</Text>
                </View>
              )}
            </View>
            
            <Paragraph style={styles.locationText}>
              📍 {item.fieldLocation}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && crops.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading crops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search crops..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {filteredCrops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No crops found matching your search.' : 'No crops planted yet.'}
          </Text>
          {!searchQuery && user?.role === 'manager' && (
            <Text style={styles.emptySubText}>
              Tap the + button to plant your first crop.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredCrops}
          renderItem={renderCropCard}
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
          label="Plant Crop"
          onPress={() => navigation.navigate('AddCrop')}
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
  cropCard: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cropDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  stageChip: {
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cardContent: {
    marginTop: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  yieldValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
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

export default CropListScreen;