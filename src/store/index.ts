import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import catalogReducer from './slices/catalogSlice';
import tryOnReducer from './slices/tryOnSlice';
import { marketplacePersistenceMiddleware } from './middleware/persistence';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    customer: customerReducer,
    catalog: catalogReducer,
    tryOn: tryOnReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(marketplacePersistenceMiddleware.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

