import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import animalSlice from './slices/animalSlice';
import cropSlice from './slices/cropSlice';
import taskSlice from './slices/taskSlice';
import dashboardSlice from './slices/dashboardSlice';
import notificationSlice from './slices/notificationSlice';
import offlineSlice from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    animals: animalSlice,
    crops: cropSlice,
    tasks: taskSlice,
    dashboard: dashboardSlice,
    notifications: notificationSlice,
    offline: offlineSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;