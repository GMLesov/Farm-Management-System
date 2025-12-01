import { Animal, PaginatedResponse, QueryParams } from '../../types/api';

export const animalService = {
  getAnimals: jest.fn<Promise<PaginatedResponse<Animal>>, [string, QueryParams?]>(),
  getAnimal: jest.fn<Promise<Animal>, [string]>(),
  createAnimal: jest.fn<Promise<Animal>, [Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>]>(),
  updateAnimal: jest.fn<Promise<Animal>, [string, Partial<Animal>]>(),
  deleteAnimal: jest.fn<Promise<void>, [string]>(),
  addHealthRecord: jest.fn(),
  updateHealthRecord: jest.fn(),
  deleteHealthRecord: jest.fn(),
  addProductionRecord: jest.fn(),
  updateProductionRecord: jest.fn(),
  deleteProductionRecord: jest.fn(),
  addFeedingSchedule: jest.fn(),
  updateFeedingSchedule: jest.fn(),
  deleteFeedingSchedule: jest.fn(),
  getAnimalAnalytics: jest.fn(),
  getHealthRecordById: jest.fn(),
  getProductionRecordById: jest.fn(),
  getFeedingScheduleById: jest.fn(),
};

// Export Animal type for convenience
export type { Animal } from '../../types/api';
