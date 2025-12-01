export const createMockUser = () => ({
  email: `test${Date.now()}@example.com`,
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'farmer',
  farmName: 'Test Farm'
});

export const createMockFarm = () => ({
  name: 'Test Farm',
  location: 'Test Location',
  size: 100,
});
