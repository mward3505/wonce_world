import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { loadProfiles, saveProfiles, loadProgress, saveProgress, loadPin, savePin, loadLanguage, saveLanguage } from '../utils/storage';
import { Language } from '../i18n/translations';

export interface Profile {
  id: string;
  name: string;
  avatarColor: string;
}

export interface ModuleProgress {
  letters: number;
  numbers: number;
  colors: number;
  shapes: number;
}

export type ProgressData = {
  [profileId: string]: ModuleProgress;
};

export type ModuleType = 'letters' | 'numbers' | 'colors' | 'shapes';

interface AppState {
  profiles: Profile[];
  activeProfile: Profile | null;
  progress: ProgressData;
  parentPin: string | null;
  language: Language;
  loaded: boolean;
}

type AppAction =
  | { type: 'SET_LOADED'; profiles: Profile[]; progress: ProgressData; parentPin: string | null; language: Language }
  | { type: 'SET_ACTIVE_PROFILE'; profile: Profile | null }
  | { type: 'ADD_PROFILE'; profile: Profile }
  | { type: 'UPDATE_PROFILE'; profile: Profile }
  | { type: 'DELETE_PROFILE'; profileId: string }
  | { type: 'UPDATE_PROGRESS'; profileId: string; module: ModuleType; value: number }
  | { type: 'UPDATE_PIN'; pin: string }
  | { type: 'SET_LANGUAGE'; language: Language };

interface AppContextValue extends AppState {
  setActiveProfile: (profile: Profile | null) => void;
  addProfile: (name: string, avatarColor: string) => void;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (profileId: string) => void;
  updateProgress: (profileId: string, module: ModuleType, value: number) => void;
  getProgress: (profileId: string) => ModuleProgress;
  updatePin: (pin: string) => void;
  setLanguage: (lang: Language) => void;
}

const defaultModuleProgress: ModuleProgress = {
  letters: 0,
  numbers: 0,
  colors: 0,
  shapes: 0,
};

const AppContext = createContext<AppContextValue | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADED':
      return { ...state, profiles: action.profiles, progress: action.progress, parentPin: action.parentPin, language: action.language, loaded: true };

    case 'UPDATE_PIN':
      return { ...state, parentPin: action.pin };

    case 'SET_LANGUAGE':
      return { ...state, language: action.language };

    case 'SET_ACTIVE_PROFILE':
      return { ...state, activeProfile: action.profile };

    case 'ADD_PROFILE': {
      const profiles = [...state.profiles, action.profile];
      return { ...state, profiles };
    }

    case 'UPDATE_PROFILE': {
      const profiles = state.profiles.map((p) =>
        p.id === action.profile.id ? action.profile : p
      );
      return { ...state, profiles };
    }

    case 'DELETE_PROFILE': {
      const profiles = state.profiles.filter((p) => p.id !== action.profileId);
      const progress = { ...state.progress };
      delete progress[action.profileId];
      const activeProfile =
        state.activeProfile?.id === action.profileId ? null : state.activeProfile;
      return { ...state, profiles, progress, activeProfile };
    }

    case 'UPDATE_PROGRESS': {
      const existing = state.progress[action.profileId] ?? { ...defaultModuleProgress };
      const updated: ModuleProgress = { ...existing, [action.module]: action.value };
      const progress = { ...state.progress, [action.profileId]: updated };
      return { ...state, progress };
    }

    default:
      return state;
  }
}

const initialState: AppState = {
  profiles: [],
  activeProfile: null,
  progress: {},
  parentPin: null,
  language: 'en',
  loaded: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function load() {
      const [profiles, progress, parentPin, language] = await Promise.all([
        loadProfiles(), loadProgress(), loadPin(), loadLanguage(),
      ]);
      dispatch({ type: 'SET_LOADED', profiles, progress, parentPin, language });
    }
    load();
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveProfiles(state.profiles);
    }
  }, [state.profiles, state.loaded]);

  useEffect(() => {
    if (state.loaded) {
      saveProgress(state.progress);
    }
  }, [state.progress, state.loaded]);

  useEffect(() => {
    if (state.loaded) {
      savePin(state.parentPin);
    }
  }, [state.parentPin, state.loaded]);

  const setActiveProfile = useCallback((profile: Profile | null) => {
    dispatch({ type: 'SET_ACTIVE_PROFILE', profile });
  }, []);

  const addProfile = useCallback((name: string, avatarColor: string) => {
    const profile: Profile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name,
      avatarColor,
    };
    dispatch({ type: 'ADD_PROFILE', profile });
  }, []);

  const updateProfile = useCallback((profile: Profile) => {
    dispatch({ type: 'UPDATE_PROFILE', profile });
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    dispatch({ type: 'DELETE_PROFILE', profileId });
  }, []);

  const updateProgress = useCallback(
    (profileId: string, module: ModuleType, value: number) => {
      dispatch({ type: 'UPDATE_PROGRESS', profileId, module, value });
    },
    []
  );

  const getProgress = useCallback(
    (profileId: string): ModuleProgress => {
      return state.progress[profileId] ?? { ...defaultModuleProgress };
    },
    [state.progress]
  );

  const updatePin = useCallback((pin: string) => {
    dispatch({ type: 'UPDATE_PIN', pin });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    dispatch({ type: 'SET_LANGUAGE', language: lang });
    saveLanguage(lang);
  }, []);

  const value: AppContextValue = {
    ...state,
    setActiveProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    updateProgress,
    getProgress,
    updatePin,
    setLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
