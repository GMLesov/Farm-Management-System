import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { animalService } from '../services';
import { Animal, QueryParams, AnimalAnalytics } from '../types/api';

// Query Keys
export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (farmId: string, filters?: QueryParams) => [...animalKeys.lists(), farmId, filters] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
  analytics: (farmId: string, year?: number) => [...animalKeys.all, 'analytics', farmId, year] as const,
  health: (animalId: string) => [...animalKeys.all, 'health', animalId] as const,
  production: (animalId: string) => [...animalKeys.all, 'production', animalId] as const,
  feeding: (animalId: string) => [...animalKeys.all, 'feeding', animalId] as const,
};

// Animal List Queries
export const useAnimals = (farmId: string, params?: QueryParams) => {
  return useQuery({
    queryKey: animalKeys.list(farmId, params),
    queryFn: () => animalService.getAnimals(farmId, params),
    enabled: !!farmId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useInfiniteAnimals = (farmId: string, params?: QueryParams) => {
  return useInfiniteQuery({
    queryKey: animalKeys.list(farmId, params),
    queryFn: ({ pageParam }: { pageParam: number }) => 
      animalService.getAnimals(farmId, { ...params, page: pageParam }),
    enabled: !!farmId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Single Animal Queries
export const useAnimal = (animalId: string) => {
  return useQuery({
    queryKey: animalKeys.detail(animalId),
    queryFn: () => animalService.getAnimal(animalId),
    enabled: !!animalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Health, Production, and Feeding data comes from the main animal object
// These hooks get individual animal data which includes these nested records
export const useAnimalDetails = (animalId: string) => {
  return useQuery({
    queryKey: animalKeys.detail(animalId),
    queryFn: () => animalService.getAnimal(animalId),
    enabled: !!animalId,
    staleTime: 5 * 60 * 1000,
    select: (animal) => ({
      animal,
      healthRecords: animal.healthRecords || [],
      productionRecords: animal.productionRecords || [],
      feedingSchedule: animal.feedingSchedule || null,
    }),
  });
};

// Analytics
export const useAnimalAnalytics = (farmId: string, year?: number) => {
  return useQuery({
    queryKey: animalKeys.analytics(farmId, year),
    queryFn: () => animalService.getAnimalAnalytics(farmId, year ? { year } : undefined),
    enabled: !!farmId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Search Queries
export const useSearchAnimals = (farmId: string, searchTerm: string) => {
  return useQuery({
    queryKey: [...animalKeys.lists(), farmId, 'search', searchTerm],
    queryFn: () => animalService.searchAnimals(farmId, searchTerm),
    enabled: !!farmId && !!searchTerm && searchTerm.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Filter Queries
export const useAnimalsBySpecies = (farmId: string, species: string) => {
  return useQuery({
    queryKey: [...animalKeys.lists(), farmId, 'species', species],
    queryFn: () => animalService.getAnimalsBySpecies(farmId, species),
    enabled: !!farmId && !!species,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnimalsByStatus = (farmId: string, status: string) => {
  return useQuery({
    queryKey: [...animalKeys.lists(), farmId, 'status', status],
    queryFn: () => animalService.getAnimalsByHealthStatus(farmId, status),
    enabled: !!farmId && !!status,
    staleTime: 2 * 60 * 1000,
  });
};

// Mutations
export const useCreateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) =>
      animalService.createAnimal(animalData),
    onSuccess: (newAnimal) => {
      // Invalidate and refetch animal lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(animalKeys.detail(newAnimal.id), newAnimal);
    },
  });
};

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, data }: { animalId: string; data: Partial<Animal> }) =>
      animalService.updateAnimal(animalId, data),
    onSuccess: (updatedAnimal) => {
      // Update animal in cache
      queryClient.setQueryData(animalKeys.detail(updatedAnimal.id), updatedAnimal);
      
      // Invalidate lists to show updates
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
};

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animalId: string) => animalService.deleteAnimal(animalId),
    onSuccess: (_, animalId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: animalKeys.detail(animalId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
};

// Health Record Mutations
export const useAddHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, record }: { animalId: string; record: any }) =>
      animalService.addHealthRecord(animalId, record),
    onSuccess: (_, { animalId }) => {
      // Invalidate animal detail to update health records
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
};

// Production Record Mutations
export const useAddProductionRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, record }: { animalId: string; record: any }) =>
      animalService.addProductionRecord(animalId, record),
    onSuccess: (_, { animalId }) => {
      // Invalidate animal detail to update production records
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
};

// Feeding Schedule Mutations
export const useUpdateFeedingSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, schedule }: { animalId: string; schedule: any }) =>
      animalService.updateFeedingSchedule(animalId, schedule),
    onSuccess: (_, { animalId }) => {
      // Invalidate animal detail to update feeding schedule
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
};

// Bulk Operations
export const useBulkUpdateAnimals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: { animalId: string; data: Partial<Animal> }[]) =>
      animalService.bulkUpdateAnimals(updates),
    onSuccess: () => {
      // Invalidate all animal queries
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
  });
};

// Export Data
export const useExportAnimals = () => {
  return useMutation({
    mutationFn: ({ farmId, format }: { farmId: string; format?: 'csv' | 'xlsx' }) =>
      animalService.exportAnimals(farmId, format),
  });
};