import { configureStore, type Middleware } from "@reduxjs/toolkit";
import themeReducer, { setThemeMode } from "../features/theme/themeSlice";
import selectedReducer, { setUnderlying } from "../features/selected/selectedSlice";
import { openInterestApi } from "../app/services/openInterest";
import drawerReducer from "../features/drawer/drawerSlice";
import identifiers, { type IdentifiersType as UnderlyingType } from "../identifiers";

const localStorageMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (typeof action === "object" && action !== null && "type" in action) { 
    if (action.type === "theme/setThemeMode" && "payload" in action && typeof action.payload === "string") {
      localStorage.setItem("themeMode", action.payload);
    };

    if (action.type === "selected/setUnderlying" && "payload" in action && typeof action.payload === "string") {
      localStorage.setItem("underlying", action.payload);
    };
  };

  return result;
};

const store = configureStore({
  reducer: {
    theme: themeReducer,
    selected: selectedReducer,
    drawer: drawerReducer,
    [openInterestApi.reducerPath]: openInterestApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(openInterestApi.middleware, localStorageMiddleware),
});

const themeMode = localStorage.getItem("themeMode");
const underlying = localStorage.getItem("underlying");

if (themeMode === "light" || themeMode === "dark") {
  store.dispatch(setThemeMode(themeMode));
};

const isValidUnderlying = (underlying: string | null): underlying is UnderlyingType => {
  return underlying !== null && (identifiers).includes(underlying as UnderlyingType);
};

if (isValidUnderlying(underlying)) {
  store.dispatch(setUnderlying(underlying));
};

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;