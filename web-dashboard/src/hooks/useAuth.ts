import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import { User } from '../types/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'owner' | 'manager' | 'worker';
}

// Query Keys
export const authKeys = {
  profile: ['auth', 'profile'] as const,
  user: (id: string) => ['auth', 'user', id] as const,
};

// Profile Queries
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Auth Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Cache user profile
      queryClient.setQueryData(authKeys.profile, data.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register({
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: data.password,
      role: data.role,
    }),
    onSuccess: (data) => {
      // Cache user profile
      queryClient.setQueryData(authKeys.profile, data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update cached profile
      queryClient.setQueryData(authKeys.profile, updatedUser);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword(data),
  });
};