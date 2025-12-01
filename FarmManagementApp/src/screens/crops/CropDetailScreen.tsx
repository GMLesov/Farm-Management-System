import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  IconButton,
  Text,
  ActivityIndicator,
  ProgressBar,
  Button,
  Menu,
  Modal,
  Portal,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, RouteProp } from '@react-navigation/native';

import { RootState, AppDispatch } from '../../store';
import { 
  updateCrop, 
  addFertilizerRecord,
  addIrrigationRecord,
  addPestControlRecord 
} from '../../store/slices/cropSlice';
import { Crop, FertilizerRecord, IrrigationRecord, PestControlRecord } from '../../types';
import { RootStackParamList } from '../../navigation';

type CropDetailRouteProp = RouteProp<RootStackParamList, 'CropDetail'>;

const CropDetailScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<CropDetailRouteProp>();
  const { cropId } = route.params;
  
  const { crops } = useSelector((state: RootState) => state.crops);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'fertilizer' | 'irrigation' | 'pest' | 'stage'>('fertilizer');
  const [stageMenuVisible, setStageMenuVisible] = useState(false);

  const crop = crops.find(c => c.id === cropId);

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you'd refetch the specific crop data
    setRefreshing(false);
  };

  const getStageColor = (stage: Crop['stage']) => {
    switch (stage) {
      case 'planted': return '#8BC34A';
      case 'growing': return '#4CAF50';
      case 'flowering': return '#FF9800';
      case 'fruiting': return '#FF5722';
      case 'harvested': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStageProgress = (stage: Crop['stage']) => {
    switch (stage) {
      case 'planted': return 0.2;
      case 'growing': return 0.4;
      case 'flowering': return 0.6;
      case 'fruiting': return 0.8;
      case 'harvested': return 1.0;
      default: return 0;
    }
  };

  const stageOptions = [
    { label: 'Planted', value: 'planted' },
    { label: 'Growing', value: 'growing' },
    { label: 'Flowering', value: 'flowering' },
    { label: 'Fruiting', value: 'fruiting' },
    { label: 'Harvested', value: 'harvested' },
  ];

  const handleStageUpdate = (newStage: Crop['stage']) => {
    if (crop) {
      const updateData: Partial<Crop> = { stage: newStage };
      if (newStage === 'harvested') {
        updateData.actualHarvestDate = new Date();
      }
      dispatch(updateCrop({ id: crop.id, data: updateData }));
    }
    setStageMenuVisible(false);
  };

  const handleAddRecord = (_type: 'fertilizer' | 'irrigation' | 'pest') => {
    setModalType(_type);
    setModalVisible(true);
  };

  const submitFertilizerRecord = async (values: any) => {
    if (crop) {
      const record: Omit<FertilizerRecord, 'id'> = {
        date: new Date(values.date),
        fertilizerType: values.fertilizerType,
        quantity: parseFloat(values.quantity),
        unit: values.unit,
        cost: values.cost ? parseFloat(values.cost) : undefined,
        appliedBy: user?.uid || '',
        notes: values.notes,
      };
      await dispatch(addFertilizerRecord({ cropId: crop.id, fertilizerData: record }));
      setModalVisible(false);
    }
  };

  const submitIrrigationRecord = async (values: any) => {
    if (crop) {
      const record: Omit<IrrigationRecord, 'id'> = {
        date: new Date(values.date),
        duration: parseInt(values.duration),
        method: values.method,
        waterSource: values.waterSource,
        recordedBy: user?.uid || '',
      };
      await dispatch(addIrrigationRecord({ cropId: crop.id, irrigationData: record }));
      setModalVisible(false);
    }
  };

  const submitPestControlRecord = async (values: any) => {
    if (crop) {
      const record: Omit<PestControlRecord, 'id'> = {
        date: new Date(values.date),
        pestType: values.pestType,
        treatmentUsed: values.treatmentUsed,
        quantity: parseFloat(values.quantity),
        cost: values.cost ? parseFloat(values.cost) : undefined,
        appliedBy: user?.uid || '',
        effectiveness: values.effectiveness,
      };
      await dispatch(addPestControlRecord({ cropId: crop.id, pestControlData: record }));
      setModalVisible(false);
    }
  };

  if (!crop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading crop details...</Text>
      </View>
    );
  }

  const daysFromPlanting = Math.ceil(
    (new Date().getTime() - new Date(crop.plantingDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysUntilHarvest = Math.ceil(
    (new Date(crop.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.cropInfo}>
                <Title style={styles.cropName}>{crop.name}</Title>
                <Paragraph style={styles.cropDetails}>
                  {crop.variety} • {crop.area} hectares
                </Paragraph>
                <Paragraph style={styles.locationText}>📍 {crop.fieldLocation}</Paragraph>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Growth Progress</Text>
                <Menu
                  visible={stageMenuVisible}
                  onDismiss={() => setStageMenuVisible(false)}
                  anchor={
                    <Chip
                      mode="outlined"
                      style={[styles.stageChip, { borderColor: getStageColor(crop.stage) }]}
                      textStyle={{ color: getStageColor(crop.stage) }}
                      onPress={() => user?.role === 'manager' && setStageMenuVisible(true)}
                    >
                      {crop.stage.charAt(0).toUpperCase() + crop.stage.slice(1)}
                    </Chip>
                  }
                >
                  {stageOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => handleStageUpdate(option.value as Crop['stage'])}
                      title={option.label}
                    />
                  ))}
                </Menu>
              </View>
              <ProgressBar
                progress={getStageProgress(crop.stage)}
                color={getStageColor(crop.stage)}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Days Planted</Text>
                <Text style={styles.statValue}>{daysFromPlanting}</Text>
              </View>
              {crop.stage !== 'harvested' && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Days to Harvest</Text>
                  <Text style={styles.statValue}>{Math.max(0, daysUntilHarvest)}</Text>
                </View>
              )}
              {crop.harvestYield && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Yield</Text>
                  <Text style={styles.yieldValue}>{crop.harvestYield} tons</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Fertilizer Records */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>🌱 Fertilizer Applications</Title>
              {user?.role === 'manager' && (
                <IconButton
                  icon="plus"
                  size={24}
                  onPress={() => handleAddRecord('fertilizer')}
                />
              )}
            </View>
            {crop.fertilizerPlan.length === 0 ? (
              <Text style={styles.emptyText}>No fertilizer applications recorded</Text>
            ) : (
              crop.fertilizerPlan.slice(0, 3).map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <Text style={styles.recordDate}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.recordText}>
                    {record.fertilizerType} - {record.quantity} {record.unit}
                  </Text>
                  {record.cost && (
                    <Text style={styles.recordCost}>${record.cost}</Text>
                  )}
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Irrigation Records */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>💧 Irrigation Schedule</Title>
              {user?.role === 'manager' && (
                <IconButton
                  icon="plus"
                  size={24}
                  onPress={() => handleAddRecord('irrigation')}
                />
              )}
            </View>
            {crop.irrigationSchedule.length === 0 ? (
              <Text style={styles.emptyText}>No irrigation records</Text>
            ) : (
              crop.irrigationSchedule.slice(0, 3).map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <Text style={styles.recordDate}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.recordText}>
                    {record.method} - {record.duration} minutes
                  </Text>
                  <Text style={styles.recordSource}>Source: {record.waterSource}</Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Pest Control Records */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>🐛 Pest Control</Title>
              {user?.role === 'manager' && (
                <IconButton
                  icon="plus"
                  size={24}
                  onPress={() => handleAddRecord('pest')}
                />
              )}
            </View>
            {crop.pestControlLog.length === 0 ? (
              <Text style={styles.emptyText}>No pest control records</Text>
            ) : (
              crop.pestControlLog.slice(0, 3).map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <Text style={styles.recordDate}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.recordText}>
                    {record.pestType} - {record.treatmentUsed}
                  </Text>
                  {record.effectiveness && (
                    <Chip
                      mode="outlined"
                      style={styles.effectivenessChip}
                      textStyle={styles.effectivenessText}
                    >
                      {record.effectiveness}
                    </Chip>
                  )}
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Record Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>
              Add {modalType === 'fertilizer' ? 'Fertilizer' : modalType === 'irrigation' ? 'Irrigation' : 'Pest Control'} Record
            </Title>
            
            {/* Modal forms would go here - simplified for brevity */}
            <Text style={styles.modalText}>
              Form for adding {modalType} records would be implemented here with proper validation.
            </Text>
            
            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button mode="contained" onPress={() => setModalVisible(false)}>
                Add Record
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cropDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#888',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stageChip: {
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  yieldValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  recordItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  recordText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  recordCost: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  recordSource: {
    fontSize: 12,
    color: '#888',
  },
  effectivenessChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  effectivenessText: {
    fontSize: 12,
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
});

export default CropDetailScreen;