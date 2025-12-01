import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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
  Chip,
  Switch,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { RootState, AppDispatch } from '../../store';
import { addTask } from '../../store/slices/taskSlice';
import { Task, User } from '../../types';
import { RootStackParamList } from '../../navigation';

type AddTaskNavigationProp = StackNavigationProp<RootStackParamList, 'AddTask'>;

const AddTaskScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AddTaskNavigationProp>();
  
  const { isLoading } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const { animals } = useSelector((state: RootState) => state.animals);
  const { crops } = useSelector((state: RootState) => state.crops);
  
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [assigneeMenuVisible, setAssigneeMenuVisible] = useState(false);
  const [relatedEntityMenuVisible, setRelatedEntityMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);

  // Mock workers data - in real app, this would come from a users collection
  const workers = [
    { uid: 'worker1', email: 'worker1@farm.com', name: 'Worker One' },
    { uid: 'worker2', email: 'worker2@farm.com', name: 'Worker Two' },
  ];

  const taskTypes = [
    { label: 'Feeding', value: 'feeding' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Harvesting', value: 'harvesting' },
    { label: 'Planting', value: 'planting' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Inspection', value: 'inspection' },
    { label: 'Other', value: 'other' },
  ];

  const priorities = [
    { label: 'Low', value: 'low', color: '#4CAF50' },
    { label: 'Medium', value: 'medium', color: '#FF9800' },
    { label: 'High', value: 'high', color: '#F44336' },
    { label: 'Urgent', value: 'urgent', color: '#9C27B0' },
  ];

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .required('Task title is required')
      .min(3, 'Title must be at least 3 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters'),
    type: Yup.string().required('Task type is required'),
    priority: Yup.string().required('Priority is required'),
    assignedTo: Yup.string().required('Assignee is required'),
    dueDate: Yup.date()
      .required('Due date is required')
      .min(new Date(), 'Due date cannot be in the past'),
    estimatedDuration: Yup.number()
      .min(1, 'Duration must be at least 1 minute')
      .max(1440, 'Duration cannot exceed 24 hours'),
    location: Yup.string(),
    category: Yup.string(),
  });

  const initialValues = {
    title: '',
    description: '',
    type: '',
    priority: '',
    assignedTo: '',
    relatedEntityId: '',
    relatedEntityType: '',
    dueDate: new Date(),
    estimatedDuration: '',
    location: '',
    category: '',
    notes: '',
  };

  const handleSubmit = async (values: any) => {
    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: values.title,
        description: values.description,
        type: values.type as Task['type'],
        category: values.category || undefined,
        priority: values.priority as Task['priority'],
        status: 'pending',
        assignedTo: values.assignedTo,
        assignedBy: user?.uid || '',
        relatedEntityId: values.relatedEntityId || undefined,
        relatedEntityType: values.relatedEntityType as 'animal' | 'crop' || undefined,
        dueDate: values.dueDate,
        estimatedDuration: values.estimatedDuration ? parseInt(values.estimatedDuration) : undefined,
        proofPhotos: [],
        notes: values.notes || undefined,
        location: values.location || undefined,
        farmId: user?.farmId || 'farm1',
      };

      await dispatch(addTask(taskData)).unwrap();
      Alert.alert('Success', 'Task created successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const getRelatedEntities = () => {
    return [
      ...animals.map(animal => ({ id: animal.id, name: animal.name, type: 'animal' })),
      ...crops.map(crop => ({ id: crop.id, name: crop.name, type: 'crop' })),
    ];
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create New Task</Title>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
              <View>
                {/* Task Title */}
                <TextInput
                  label="Task Title"
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  mode="outlined"
                  style={styles.input}
                  error={touched.title && !!errors.title}
                />
                <HelperText type="error" visible={touched.title && !!errors.title}>
                  {errors.title}
                </HelperText>

                {/* Description */}
                <TextInput
                  label="Description"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  error={touched.description && !!errors.description}
                />
                <HelperText type="error" visible={touched.description && !!errors.description}>
                  {errors.description}
                </HelperText>

                {/* Task Type */}
                <Menu
                  visible={typeMenuVisible}
                  onDismiss={() => setTypeMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Task Type"
                      value={taskTypes.find(t => t.value === values.type)?.label || ''}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setTypeMenuVisible(true)} />}
                      onPressIn={() => setTypeMenuVisible(true)}
                      showSoftInputOnFocus={false}
                      error={touched.type && !!errors.type}
                    />
                  }
                >
                  {taskTypes.map((type) => (
                    <Menu.Item
                      key={type.value}
                      onPress={() => {
                        setFieldValue('type', type.value);
                        setTypeMenuVisible(false);
                      }}
                      title={type.label}
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={touched.type && !!errors.type}>
                  {errors.type}
                </HelperText>

                {/* Priority */}
                <Menu
                  visible={priorityMenuVisible}
                  onDismiss={() => setPriorityMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Priority"
                      value={priorities.find(p => p.value === values.priority)?.label || ''}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setPriorityMenuVisible(true)} />}
                      onPressIn={() => setPriorityMenuVisible(true)}
                      showSoftInputOnFocus={false}
                      error={touched.priority && !!errors.priority}
                    />
                  }
                >
                  {priorities.map((priority) => (
                    <Menu.Item
                      key={priority.value}
                      onPress={() => {
                        setFieldValue('priority', priority.value);
                        setPriorityMenuVisible(false);
                      }}
                      title={
                        <View style={styles.priorityMenuItem}>
                          <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                          <Text>{priority.label}</Text>
                        </View>
                      }
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={touched.priority && !!errors.priority}>
                  {errors.priority}
                </HelperText>

                {/* Assignee */}
                <Menu
                  visible={assigneeMenuVisible}
                  onDismiss={() => setAssigneeMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Assign To"
                      value={workers.find(w => w.uid === values.assignedTo)?.name || ''}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setAssigneeMenuVisible(true)} />}
                      onPressIn={() => setAssigneeMenuVisible(true)}
                      showSoftInputOnFocus={false}
                      error={touched.assignedTo && !!errors.assignedTo}
                    />
                  }
                >
                  {workers.map((worker) => (
                    <Menu.Item
                      key={worker.uid}
                      onPress={() => {
                        setFieldValue('assignedTo', worker.uid);
                        setAssigneeMenuVisible(false);
                      }}
                      title={`${worker.name} (${worker.email})`}
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={touched.assignedTo && !!errors.assignedTo}>
                  {errors.assignedTo}
                </HelperText>

                {/* Due Date */}
                <TextInput
                  label="Due Date"
                  value={values.dueDate.toLocaleDateString()}
                  mode="outlined"
                  style={styles.input}
                  right={<TextInput.Icon icon="calendar" />}
                  showSoftInputOnFocus={false}
                  error={touched.dueDate && !!errors.dueDate}
                />
                <HelperText type="error" visible={touched.dueDate && !!errors.dueDate}>
                  {typeof errors.dueDate === 'string' ? errors.dueDate : ''}
                </HelperText>

                {/* Optional Fields */}
                <TextInput
                  label="Estimated Duration (minutes)"
                  value={values.estimatedDuration}
                  onChangeText={handleChange('estimatedDuration')}
                  onBlur={handleBlur('estimatedDuration')}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={touched.estimatedDuration && !!errors.estimatedDuration}
                />

                <TextInput
                  label="Location (optional)"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Category (optional)"
                  value={values.category}
                  onChangeText={handleChange('category')}
                  onBlur={handleBlur('category')}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Additional Notes (optional)"
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  onBlur={handleBlur('notes')}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                />

                {/* Related Entity */}
                {getRelatedEntities().length > 0 && (
                  <>
                    <Menu
                      visible={relatedEntityMenuVisible}
                      onDismiss={() => setRelatedEntityMenuVisible(false)}
                      anchor={
                        <TextInput
                          label="Related Animal/Crop (optional)"
                          value={
                            getRelatedEntities().find(e => e.id === values.relatedEntityId)?.name || ''
                          }
                          mode="outlined"
                          style={styles.input}
                          right={<TextInput.Icon icon="chevron-down" onPress={() => setRelatedEntityMenuVisible(true)} />}
                          onPressIn={() => setRelatedEntityMenuVisible(true)}
                          showSoftInputOnFocus={false}
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          setFieldValue('relatedEntityId', '');
                          setFieldValue('relatedEntityType', '');
                          setRelatedEntityMenuVisible(false);
                        }}
                        title="None"
                      />
                      {getRelatedEntities().map((entity) => (
                        <Menu.Item
                          key={entity.id}
                          onPress={() => {
                            setFieldValue('relatedEntityId', entity.id);
                            setFieldValue('relatedEntityType', entity.type);
                            setRelatedEntityMenuVisible(false);
                          }}
                          title={`${entity.name} (${entity.type})`}
                        />
                      ))}
                    </Menu>
                  </>
                )}

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Create Task
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
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
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 8,
  },
  priorityMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
  },
});

export default AddTaskScreen;