import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
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
  Surface,
  Checkbox,
  Paragraph,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootStackParamList } from '../../navigation';
import { RootState, AppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface FormValues {
  email: string;
  password: string;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (values: FormValues) => {
    try {
      await dispatch(loginUser(values)).unwrap();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Contact your farm administrator or supervisor to reset your password.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <Surface style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Icon name="agriculture" size={64} color="#4CAF50" />
            <Title style={styles.title}>Farm Manager</Title>
            <Paragraph style={styles.subtitle}>Mobile App for Farm Workers</Paragraph>
          </View>
        </Surface>

        <Card style={styles.card} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.loginTitle}>Welcome Back</Title>
            <Paragraph style={styles.loginSubtitle}>
              Sign in to access your farm tasks
            </Paragraph>

            {error && (
              <Surface style={styles.errorContainer}>
                <Icon name="error" size={20} color="#f44336" />
                <Text style={styles.errorText}>{error}</Text>
              </Surface>
            )}

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Email Address"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                      error={!!(errors.email && touched.email)}
                      left={<TextInput.Icon icon="email" />}
                      placeholder="Enter your email"
                    />
                    <HelperText type="error" visible={!!(errors.email && touched.email)}>
                      {errors.email}
                    </HelperText>
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      style={styles.input}
                      error={!!(errors.password && touched.password)}
                      placeholder="Enter your password"
                    />
                    <HelperText type="error" visible={!!(errors.password && touched.password)}>
                      {errors.password}
                    </HelperText>
                  </View>

                  <View style={styles.optionsContainer}>
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        status={rememberMe ? 'checked' : 'unchecked'}
                        onPress={() => setRememberMe(!rememberMe)}
                      />
                      <Text style={styles.checkboxLabel}>Remember me</Text>
                    </View>

                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.loginButton}
                    disabled={isLoading}
                    contentStyle={styles.buttonContent}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </>
              )}
            </Formik>

            {/* Help Section */}
            <Surface style={styles.helpSection}>
              <Icon name="help" size={20} color="#666" />
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                Contact your farm manager or administrator for login assistance.
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Farm Management System v1.0
          </Text>
        </View>
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
  headerSection: {
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardContent: {
    padding: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  helpSection: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#f9f9f9',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  signupButton: {
    marginTop: 8,
  },
});

export default LoginScreen;