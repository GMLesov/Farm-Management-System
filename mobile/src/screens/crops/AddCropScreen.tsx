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
  Text,
  Menu,
  Paragraph,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { RootState, AppDispatch } from '../../store';
import { addCrop } from '../../store/slices/cropSlice';
import { Crop } from '../../types';
import { RootStackParamList } from '../../navigation';

type AddCropNavigationProp = StackNavigationProp<RootStackParamList, 'AddCrop'>;

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Crop name must be at least 2 characters')
    .required('Crop name is required'),
  variety: Yup.string()
    .min(2, 'Variety must be at least 2 characters')
    .required('Variety is required'),
  fieldLocation: Yup.string()
    .min(2, 'Field location must be at least 2 characters')
    .required('Field location is required'),
  plantingDate: Yup.date()
    .required('Planting date is required')
    .max(new Date(), 'Planting date cannot be in the future'),
  expectedHarvestDate: Yup.date()
    .required('Expected harvest date is required')
    .min(Yup.ref('plantingDate'), 'Harvest date must be after planting date'),
  stage: Yup.string()
    .oneOf(['planted', 'growing', 'flowering', 'fruiting'], 'Please select a valid stage')
    .required('Growth stage is required'),
  area: Yup.number()
    .positive('Area must be a positive number')
    .required('Area is required'),
});

interface FormValues {
  name: string;
  variety: string;
  fieldLocation: string;
  plantingDate: string;
  expectedHarvestDate: string;
  stage: Crop['stage'];
  area: string;
}

const cropOptions = [
  { label: 'Maize', value: 'Maize' },
  { label: 'Wheat', value: 'Wheat' },
  { label: 'Rice', value: 'Rice' },
  { label: 'Soybean', value: 'Soybean' },
  { label: 'Tobacco', value: 'Tobacco' },
  { label: 'Cotton', value: 'Cotton' },
  { label: 'Sunflower', value: 'Sunflower' },
  { label: 'Tomatoes', value: 'Tomatoes' },
  { label: 'Potatoes', value: 'Potatoes' },
  { label: 'Onions', value: 'Onions' },
  { label: 'Other', value: 'Other' },
];

const stageOptions = [
  { label: 'Planted', value: 'planted' },
  { label: 'Growing', value: 'growing' },
  { label: 'Flowering', value: 'flowering' },
  { label: 'Fruiting', value: 'fruiting' },
];

const AddCropScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AddCropNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.crops);
  
  const [cropMenuVisible, setCropMenuVisible] = useState(false);
  const [stageMenuVisible, setStageMenuVisible] = useState(false);

  const handleAddCrop = async (values: FormValues) => {
    try {
      if (!user?.farmId) {
        Alert.alert('Error', 'Farm ID not found. Please log out and log back in.');
        return;
      }

      const cropData: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'> = {
        name: values.name,
        variety: values.variety,
        fieldLocation: values.fieldLocation,
        plantingDate: new Date(values.plantingDate),
        expectedHarvestDate: new Date(values.expectedHarvestDate),
        stage: values.stage,
        area: parseFloat(values.area),
        fertilizerPlan: [],
        irrigationSchedule: [],
        pestControlLog: [],
        photos: [],
        farmId: user.farmId,
        managedBy: user.uid,
      };

      await dispatch(addCrop(cropData)).unwrap();
      Alert.alert('Success', 'Crop added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add crop');
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 3); // Default 3 months for harvest

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Plant New Crop</Title>
            <Paragraph style={styles.subtitle}>
              Track your crop from planting to harvest
            </Paragraph>
            
            <Formik
              initialValues={{
                name: '',
                variety: '',
                fieldLocation: '',
                plantingDate: formatDateForInput(today),
                expectedHarvestDate: formatDateForInput(nextMonth),
                stage: 'planted' as Crop['stage'],
                area: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleAddCrop}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <>
                  <Menu
                    visible={cropMenuVisible}
                    onDismiss={() => setCropMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Crop Name"
                        value={values.name}
                        mode="outlined"
                        style={styles.input}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setCropMenuVisible(true)} />}
                        onPress={() => setCropMenuVisible(true)}
                        error={!!(errors.name && touched.name)}
                      />
                    }
                  >
                    {cropOptions.map((option) => (
                      <Menu.Item
                        key={option.value}
                        onPress={() => {
                          setFieldValue('name', option.value);
                          setCropMenuVisible(false);
                        }}
                        title={option.label}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={!!(errors.name && touched.name)}>
                    {errors.name}
                  </HelperText>

                  <TextInput
                    label="Variety"
                    value={values.variety}
                    onChangeText={handleChange('variety')}
                    onBlur={handleBlur('variety')}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., SC627, Pioneer 3025"
                    error={!!(errors.variety && touched.variety)}
                  />
                  <HelperText type="error" visible={!!(errors.variety && touched.variety)}>
                    {errors.variety}
                  </HelperText>

                  <TextInput
                    label="Field Location"
                    value={values.fieldLocation}
                    onChangeText={handleChange('fieldLocation')}
                    onBlur={handleBlur('fieldLocation')}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., North Field, Plot 1A, Section B"
                    error={!!(errors.fieldLocation && touched.fieldLocation)}
                  />
                  <HelperText type="error" visible={!!(errors.fieldLocation && touched.fieldLocation)}>
                    {errors.fieldLocation}
                  </HelperText>

                  <View style={styles.dateRow}>
                    <View style={styles.dateField}>
                      <TextInput
                        label="Planting Date"
                        value={values.plantingDate}
                        onChangeText={handleChange('plantingDate')}
                        onBlur={handleBlur('plantingDate')}
                        mode="outlined"
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        error={!!(errors.plantingDate && touched.plantingDate)}
                      />
                      <HelperText type="error" visible={!!(errors.plantingDate && touched.plantingDate)}>
                        {errors.plantingDate}
                      </HelperText>
                    </View>

                    <View style={styles.dateField}>
                      <TextInput
                        label="Expected Harvest"
                        value={values.expectedHarvestDate}
                        onChangeText={handleChange('expectedHarvestDate')}
                        onBlur={handleBlur('expectedHarvestDate')}
                        mode="outlined"
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        error={!!(errors.expectedHarvestDate && touched.expectedHarvestDate)}
                      />
                      <HelperText type="error" visible={!!(errors.expectedHarvestDate && touched.expectedHarvestDate)}>
                        {errors.expectedHarvestDate}
                      </HelperText>
                    </View>
                  </View>

                  <Menu
                    visible={stageMenuVisible}
                    onDismiss={() => setStageMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Current Growth Stage"
                        value={stageOptions.find(opt => opt.value === values.stage)?.label || ''}
                        mode="outlined"
                        style={styles.input}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setStageMenuVisible(true)} />}
                        onPress={() => setStageMenuVisible(true)}
                        editable={false}
                        error={!!(errors.stage && touched.stage)}
                      />
                    }
                  >
                    {stageOptions.map((option) => (
                      <Menu.Item
                        key={option.value}
                        onPress={() => {
                          setFieldValue('stage', option.value);
                          setStageMenuVisible(false);
                        }}
                        title={option.label}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={!!(errors.stage && touched.stage)}>
                    {errors.stage}
                  </HelperText>

                  <TextInput
                    label="Area (hectares)"
                    value={values.area}
                    onChangeText={handleChange('area')}
                    onBlur={handleBlur('area')}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="e.g., 2.5"
                    error={!!(errors.area && touched.area)}
                  />
                  <HelperText type="error" visible={!!(errors.area && touched.area)}>
                    {errors.area}
                  </HelperText>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 Pro Tip</Text>
                    <Text style={styles.infoText}>
                      You can track fertilizer applications, irrigation schedules, and pest control after adding the crop.
                    </Text>
                  </View>

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
                      {isLoading ? <ActivityIndicator color="white" /> : 'Plant Crop'}
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
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

export default AddCropScreen;