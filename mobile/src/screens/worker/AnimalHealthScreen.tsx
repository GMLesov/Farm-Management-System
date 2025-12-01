import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  RadioButton,
  Chip,
  Text,
  Surface,
  HelperText,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { RootState, AppDispatch } from '../../store';
import { addHealthRecord } from '../../store/slices/animalSlice';
import { OfflineStatusBar } from '../../components/OfflineStatus';
import { MediaCapture } from '../../components/MediaCapture';
import { MediaItem } from '../../services/MediaCaptureService';

interface HealthObservation {
  animalId: string;
  animalName: string;
  observations: string;
  healthStatus: 'healthy' | 'sick' | 'treatment' | 'quarantine';
  temperature?: number;
  symptoms: string[];
  treatment?: string;
  mediaItems: MediaItem[];
  veterinarianNeeded: boolean;
  notes: string;
}

const AnimalHealthScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { animals, isLoading } = useSelector((state: RootState) => state.animals);
  
  const [selectedAnimal, setSelectedAnimal] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'sick' | 'treatment' | 'quarantine'>('healthy');
  const [temperature, setTemperature] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [treatment, setTreatment] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [veterinarianNeeded, setVeterinarianNeeded] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const commonSymptoms = [
    'Loss of appetite',
    'Lethargy',
    'Fever',
    'Coughing',
    'Discharge from nose/eyes',
    'Diarrhea',
    'Vomiting',
    'Limping',
    'Swelling',
    'Unusual behavior',
    'Weight loss',
    'Difficulty breathing',
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleMediaAdded = (media: MediaItem) => {
    setMediaItems(prev => [...prev, media]);
  };

  const handleMediaRemoved = (mediaId: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== mediaId));
  };

  const handleSubmit = async () => {
    if (!selectedAnimal) {
      Alert.alert('Error', 'Please select an animal');
      return;
    }

    if (!observations.trim()) {
      Alert.alert('Error', 'Please enter your observations');
      return;
    }

    const selectedAnimalData = animals.find(a => a.id === selectedAnimal);
    if (!selectedAnimalData) {
      Alert.alert('Error', 'Selected animal not found');
      return;
    }

    setSaving(true);

    try {
      const healthRecord: HealthObservation = {
        animalId: selectedAnimal,
        animalName: selectedAnimalData.name,
        observations,
        healthStatus,
        temperature: temperature ? parseFloat(temperature) : undefined,
        symptoms,
        treatment,
        mediaItems,
        veterinarianNeeded,
        notes,
      };

      await dispatch(addHealthRecord({
        animalId: selectedAnimal,
        record: {
          id: Date.now().toString(),
          date: new Date(),
          type: 'health_check',
          description: observations,
          healthStatus,
          temperature: temperature ? parseFloat(temperature) : undefined,
          symptoms: symptoms.join(', '),
          treatment,
          photos: mediaItems.map(item => item.uri), // Convert media items to photo URLs
          veterinarianNeeded,
          notes,
          recordedBy: user?.uid || '',
          recordedByName: user?.name || '',
        },
      }));

      Alert.alert(
        'Success',
        'Health observation recorded successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save health record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <OfflineStatusBar />
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Animal Health Observation</Title>
            <Text style={styles.subtitle}>
              Record health observations and any concerns about the animals
            </Text>

            {/* Animal Selection */}
            <Text style={styles.sectionTitle}>Select Animal</Text>
            <View style={styles.animalGrid}>
              {animals.map((animal) => (
                <TouchableOpacity
                  key={animal.id}
                  style={[
                    styles.animalCard,
                    selectedAnimal === animal.id && styles.selectedAnimalCard,
                  ]}
                  onPress={() => setSelectedAnimal(animal.id)}
                >
                  <Text style={styles.animalName}>{animal.name}</Text>
                  <Text style={styles.animalDetails}>
                    {animal.species} • {animal.breed}
                  </Text>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.healthChip,
                      {
                        borderColor:
                          animal.healthStatus === 'healthy'
                            ? '#4CAF50'
                            : animal.healthStatus === 'sick'
                            ? '#f44336'
                            : '#ff9800',
                      },
                    ]}
                  >
                    {animal.healthStatus}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>

            {selectedAnimal && (
              <>
                {/* Health Status */}
                <Text style={styles.sectionTitle}>Health Status</Text>
                <RadioButton.Group
                  onValueChange={(value) => setHealthStatus(value as any)}
                  value={healthStatus}
                >
                  {[
                    { value: 'healthy', label: 'Healthy', color: '#4CAF50' },
                    { value: 'sick', label: 'Sick', color: '#f44336' },
                    { value: 'treatment', label: 'Under Treatment', color: '#ff9800' },
                    { value: 'quarantine', label: 'Quarantine', color: '#9C27B0' },
                  ].map((option) => (
                    <View key={option.value} style={styles.radioOption}>
                      <RadioButton value={option.value} />
                      <Text style={[styles.radioLabel, { color: option.color }]}>
                        {option.label}
                      </Text>
                    </View>
                  ))}
                </RadioButton.Group>

                {/* Temperature */}
                <TextInput
                  label="Temperature (°C)"
                  value={temperature}
                  onChangeText={setTemperature}
                  keyboardType="numeric"
                  style={styles.input}
                  right={<TextInput.Icon icon="thermometer" />}
                />

                {/* Symptoms */}
                <Text style={styles.sectionTitle}>Symptoms (Select all that apply)</Text>
                <View style={styles.symptomsGrid}>
                  {commonSymptoms.map((symptom) => (
                    <Chip
                      key={symptom}
                      mode={symptoms.includes(symptom) ? 'flat' : 'outlined'}
                      selected={symptoms.includes(symptom)}
                      onPress={() => handleSymptomToggle(symptom)}
                      style={styles.symptomChip}
                    >
                      {symptom}
                    </Chip>
                  ))}
                </View>

                {/* Observations */}
                <TextInput
                  label="Detailed Observations *"
                  value={observations}
                  onChangeText={setObservations}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                  placeholder="Describe what you observed about the animal's condition, behavior, appearance, etc."
                />

                {/* Treatment */}
                <TextInput
                  label="Treatment Given (if any)"
                  value={treatment}
                  onChangeText={setTreatment}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="Describe any treatment, medication, or care provided"
                />

                {/* Media Capture */}
                <Text style={styles.sectionTitle}>Photos & Videos</Text>
                <MediaCapture
                  onMediaAdded={handleMediaAdded}
                  onMediaRemoved={handleMediaRemoved}
                  initialMedia={mediaItems}
                  maxItems={5}
                  allowedTypes="both"
                  showPreview={true}
                  captureOptions={{
                    quality: 0.8,
                    maxWidth: 1024,
                    maxHeight: 1024,
                  }}
                />

                {/* Veterinarian Needed */}
                <View style={styles.checkboxRow}>
                  <RadioButton.Group
                    onValueChange={(value) => setVeterinarianNeeded(value === 'yes')}
                    value={veterinarianNeeded ? 'yes' : 'no'}
                  >
                    <Text style={styles.sectionTitle}>Veterinarian Needed?</Text>
                    <View style={styles.radioOption}>
                      <RadioButton value="yes" />
                      <Text style={styles.radioLabel}>Yes, urgent attention required</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="no" />
                      <Text style={styles.radioLabel}>No, routine observation</Text>
                    </View>
                  </RadioButton.Group>
                </View>

                {/* Additional Notes */}
                <TextInput
                  label="Additional Notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="Any additional information or concerns"
                />

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={saving}
                  disabled={saving || !selectedAnimal || !observations.trim()}
                  style={styles.submitButton}
                >
                  {saving ? 'Saving...' : 'Submit Health Report'}
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  animalCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  selectedAnimalCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#e3f2fd',
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  animalDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  healthChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    marginBottom: 16,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  symptomChip: {
    margin: 4,
  },
  photosSection: {
    marginBottom: 20,
  },
  addPhotoButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  addPhotoText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    position: 'relative',
    margin: 4,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  checkboxRow: {
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});

export default AnimalHealthScreen;