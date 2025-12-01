export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Signup: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Modal Screens
  TaskDetail: { taskId: string };
  AnimalDetail: { animalId: string };
  AddTask: undefined;
  EditProfile: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Health: undefined;
  Reports: undefined;
  Profile: undefined;
};

// Worker-specific navigation types
export type WorkerTabParamList = {
  Dashboard: undefined;
  MyTasks: undefined;
  AnimalHealth: undefined;
  Profile: undefined;
};

// Admin-specific navigation types (for future use)
export type AdminTabParamList = {
  Overview: undefined;
  Management: undefined;
  Workers: undefined;
  Settings: undefined;
};

// Common navigation prop types
export type ScreenNavigationProp<T extends keyof RootStackParamList> = {
  navigation: any; // Use proper navigation type from react-navigation
  route: { params?: RootStackParamList[T] };
};