import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Subheading,
  HelperText,
  ActivityIndicator,
  RadioButton,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../navigation';
import { RootState, AppDispatch } from '../../store';
import { signupUser } from '../../store/slices/authSlice';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

interface Props {
  navigation: SignupScreenNavigationProp;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['manager', 'worker'], 'Please select a role')
    .required('Role is required'),
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'manager' | 'worker';
}

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (values: FormValues) => {
    try {
      const { confirmPassword, ...signupData } = values;
      await dispatch(signupUser(signupData)).unwrap();
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Title style={styles.title}>Create Account</Title>
          <Subheading style={styles.subtitle}>Join AgriReach Digital</Subheading>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'worker' as 'manager' | 'worker',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <>
                  <TextInput
                    label="Full Name"
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

                  <TextInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    error={!!(errors.email && touched.email)}
                  />
                  <HelperText type="error" visible={!!(errors.email && touched.email)}>
                    {errors.email}
                  </HelperText>

                  <TextInput
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                    error={!!(errors.password && touched.password)}
                  />
                  <HelperText type="error" visible={!!(errors.password && touched.password)}>
                    {errors.password}
                  </HelperText>

                  <TextInput
                    label="Confirm Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                    style={styles.input}
                    error={!!(errors.confirmPassword && touched.confirmPassword)}
                  />
                  <HelperText type="error" visible={!!(errors.confirmPassword && touched.confirmPassword)}>
                    {errors.confirmPassword}
                  </HelperText>

                  <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>I am a:</Text>
                    <RadioButton.Group
                      onValueChange={(value) => setFieldValue('role', value)}
                      value={values.role}
                    >
                      <View style={styles.radioOption}>
                        <RadioButton value="manager" />
                        <Text style={styles.radioLabel}>Farm Manager</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="worker" />
                        <Text style={styles.radioLabel}>Farm Worker</Text>
                      </View>
                    </RadioButton.Group>
                  </View>
                  <HelperText type="error" visible={!!(errors.role && touched.role)}>
                    {errors.role}
                  </HelperText>

                  {error && (
                    <HelperText type="error" visible={true} style={styles.errorText}>
                      {error}
                    </HelperText>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.signupButton}
                    disabled={isLoading}
                    contentStyle={styles.buttonContent}
                  >
                    {isLoading ? <ActivityIndicator color="white" /> : 'Create Account'}
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginButton}
                    disabled={isLoading}
                  >
                    Already have an account? Sign In
                  </Button>
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
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  input: {
    marginBottom: 8,
  },
  roleContainer: {
    marginVertical: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#4CAF50',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default SignupScreen;