import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
  RadioButton,
  Text,
  Menu,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { RootState, AppDispatch } from '../../store';
import { addAnimal } from '../../store/slices/animalSlice';
import { Animal } from '../../types';
import { RootStackParamList } from '../../navigation';

type AddAnimalNavigationProp = StackNavigationProp<RootStackParamList, 'AddAnimal'>;

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Animal name is required'),
  species: Yup.string()
    .required('Please select a species'),
  breed: Yup.string()
    .min(2, 'Breed must be at least 2 characters')
    .required('Breed is required'),
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Please select a gender')
    .required('Gender is required'),
  weight: Yup.number()
    .positive('Weight must be a positive number')
    .required('Weight is required'),
  healthStatus: Yup.string()
    .oneOf(['healthy', 'sick', 'treatment', 'quarantine'], 'Please select a health status')
    .required('Health status is required'),
  location: Yup.string()
    .min(2, 'Location must be at least 2 characters')
    .required('Location is required'),
});

interface FormValues {
  name: string;
  species: Animal['species'];
  breed: string;
  dateOfBirth?: string;
  gender: Animal['gender'];
  weight: string;
  healthStatus: Animal['healthStatus'];
  location: string;
}

const speciesOptions = [
  { label: 'Cattle', value: 'cattle' },
  { label: 'Pig', value: 'pig' },
  { label: 'Goat', value: 'goat' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Other', value: 'other' },
];

const healthStatusOptions = [
  { label: 'Healthy', value: 'healthy' },
  { label: 'Sick', value: 'sick' },
  { label: 'Under Treatment', value: 'treatment' },
  { label: 'Quarantine', value: 'quarantine' },
];

const AddAnimalScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AddAnimalNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.animals);
  
  const [speciesMenuVisible, setSpeciesMenuVisible] = useState(false);
  const [healthMenuVisible, setHealthMenuVisible] = useState(false);

  const handleAddAnimal = async (values: FormValues) => {
    try {
      if (!user?.farmId) {
        Alert.alert('Error', 'Farm ID not found. Please log out and log back in.');
        return;
      }

      const animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'> = {
        name: values.name,
        species: values.species,
        breed: values.breed,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
        gender: values.gender,
        weight: parseFloat(values.weight),
        healthStatus: values.healthStatus,
        location: values.location,
        feedLog: [],
        vaccinations: [],
        medicalHistory: [],
        photos: [],
        farmId: user.farmId,
        createdBy: user.uid,
      };

      await dispatch(addAnimal(animalData)).unwrap();
      Alert.alert('Success', 'Animal added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add animal');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Add New Animal</Title>
            
            <Formik
              initialValues={{
                name: '',
                species: 'cattle' as Animal['species'],
                breed: '',
                dateOfBirth: '',
                gender: 'female' as Animal['gender'],
                weight: '',
                healthStatus: 'healthy' as Animal['healthStatus'],
                location: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleAddAnimal}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <>
                  <TextInput
                    label="Animal Name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    mode="outlined"
                    style={styles.input}
                    error={!!(errors.name && touched.name)}
                  />
                  <HelperText type="error" visible={!!(errors.name && touched.name)}>
                    {errors.name}
                  </HelperText>

                  <Menu
                    visible={speciesMenuVisible}
                    onDismiss={() => setSpeciesMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Species"
                        value={speciesOptions.find(opt => opt.value === values.species)?.label || ''}
                        mode="outlined"
                        style={styles.input}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setSpeciesMenuVisible(true)} />}
                        onPress={() => setSpeciesMenuVisible(true)}
                        editable={false}
                        error={!!(errors.species && touched.species)}
                      />
                    }
                  >
                    {speciesOptions.map((option) => (
                      <Menu.Item
                        key={option.value}
                        onPress={() => {
                          setFieldValue('species', option.value);
                          setSpeciesMenuVisible(false);
                        }}
                        title={option.label}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={!!(errors.species && touched.species)}>
                    {errors.species}
                  </HelperText>

                  <TextInput
                    label="Breed"
                    value={values.breed}
                    onChangeText={handleChange('breed')}
                    onBlur={handleBlur('breed')}
                    mode="outlined"
                    style={styles.input}
                    error={!!(errors.breed && touched.breed)}
                  />
                  <HelperText type="error" visible={!!(errors.breed && touched.breed)}>
                    {errors.breed}
                  </HelperText>

                  <TextInput
                    label="Date of Birth (Optional)"
                    value={values.dateOfBirth}
                    onChangeText={handleChange('dateOfBirth')}
                    onBlur={handleBlur('dateOfBirth')}
                    mode="outlined"
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                  />

                  <View style={styles.radioContainer}>
                    <Text style={styles.radioLabel}>Gender:</Text>
                    <RadioButton.Group
                      onValueChange={(value) => setFieldValue('gender', value)}
                      value={values.gender}
                    >
                      <View style={styles.radioRow}>
                        <View style={styles.radioOption}>
                          <RadioButton value="male" />
                          <Text style={styles.radioText}>Male</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton value="female" />
                          <Text style={styles.radioText}>Female</Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                  </View>
                  <HelperText type="error" visible={!!(errors.gender && touched.gender)}>
                    {errors.gender}
                  </HelperText>

                  <TextInput
                    label="Weight (kg)"
                    value={values.weight}
                    onChangeText={handleChange('weight')}
                    onBlur={handleBlur('weight')}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!(errors.weight && touched.weight)}
                  />
                  <HelperText type="error" visible={!!(errors.weight && touched.weight)}>
                    {errors.weight}
                  </HelperText>

                  <Menu
                    visible={healthMenuVisible}
                    onDismiss={() => setHealthMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Health Status"
                        value={healthStatusOptions.find(opt => opt.value === values.healthStatus)?.label || ''}
                        mode="outlined"
                        style={styles.input}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setHealthMenuVisible(true)} />}
                        onPress={() => setHealthMenuVisible(true)}
                        editable={false}
                        error={!!(errors.healthStatus && touched.healthStatus)}
                      />
                    }
                  >
                    {healthStatusOptions.map((option) => (
                      <Menu.Item
                        key={option.value}
                        onPress={() => {
                          setFieldValue('healthStatus', option.value);
                          setHealthMenuVisible(false);
                        }}
                        title={option.label}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={!!(errors.healthStatus && touched.healthStatus)}>
                    {errors.healthStatus}
                  </HelperText>

                  <TextInput
                    label="Location"
                    value={values.location}
                    onChangeText={handleChange('location')}
                    onBlur={handleBlur('location')}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Pen A, Field 1, Barn 2"
                    error={!!(errors.location && touched.location)}
                  />
                  <HelperText type="error" visible={!!(errors.location && touched.location)}>
                    {errors.location}
                  </HelperText>

                  <View style={styles.buttonContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.goBack()}
                      style={styles.cancelButton}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={styles.submitButton}
                      disabled={isLoading}
                      contentStyle={styles.buttonContent}
                    >
                      {isLoading ? <ActivityIndicator color="white" /> : 'Add Animal'}
                    </Button>
                  </View>
                </>
              )}
            </Formik>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  radioContainer: {
    marginVertical: 16,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddAnimalScreen;