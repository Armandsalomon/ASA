import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';
export type InvestmentHorizon = 'short' | 'medium' | 'long';

export interface PortfolioPosition {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  riskProfile: RiskProfile;
  horizon: InvestmentHorizon;
  capital: string;
  hasCompletedOnboarding: boolean;
  completedLessons: string[];
}

interface AppContextType {
  userProfile: UserProfile;
  portfolio: PortfolioPosition[];
  chatHistory: ChatMessage[];
  anthropicKey: string;
  alphaVantageKey: string;
  isLoading: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addPosition: (position: PortfolioPosition) => Promise<void>;
  removePosition: (ticker: string) => Promise<void>;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  setAnthropicKey: (key: string) => Promise<void>;
  setAlphaVantageKey: (key: string) => Promise<void>;
  markLessonComplete: (lessonId: string) => Promise<void>;
}

const defaultProfile: UserProfile = {
  riskProfile: 'moderate',
  horizon: 'medium',
  capital: '10000',
  hasCompletedOnboarding: false,
  completedLessons: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [anthropicKey, setAnthropicKeyState] = useState('');
  const [alphaVantageKey, setAlphaVantageKeyState] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, portfolioData, anthropicKeyData, alphaKeyData] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('portfolio'),
        SecureStore.getItemAsync('anthropic_key'),
        SecureStore.getItemAsync('alphavantage_key'),
      ]);

      if (profileData) setUserProfile(JSON.parse(profileData));
      if (portfolioData) setPortfolio(JSON.parse(portfolioData));
      if (anthropicKeyData) setAnthropicKeyState(anthropicKeyData);
      if (alphaKeyData) setAlphaVantageKeyState(alphaKeyData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (update: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...update };
    setUserProfile(newProfile);
    await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const addPosition = async (position: PortfolioPosition) => {
    const existing = portfolio.findIndex(p => p.ticker === position.ticker);
    let newPortfolio: PortfolioPosition[];
    if (existing >= 0) {
      newPortfolio = portfolio.map((p, i) => i === existing ? position : p);
    } else {
      newPortfolio = [...portfolio, position];
    }
    setPortfolio(newPortfolio);
    await AsyncStorage.setItem('portfolio', JSON.stringify(newPortfolio));
  };

  const removePosition = async (ticker: string) => {
    const newPortfolio = portfolio.filter(p => p.ticker !== ticker);
    setPortfolio(newPortfolio);
    await AsyncStorage.setItem('portfolio', JSON.stringify(newPortfolio));
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  const setAnthropicKey = async (key: string) => {
    setAnthropicKeyState(key);
    await SecureStore.setItemAsync('anthropic_key', key);
  };

  const setAlphaVantageKey = async (key: string) => {
    setAlphaVantageKeyState(key);
    await SecureStore.setItemAsync('alphavantage_key', key);
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!userProfile.completedLessons.includes(lessonId)) {
      await updateUserProfile({
        completedLessons: [...userProfile.completedLessons, lessonId],
      });
    }
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      portfolio,
      chatHistory,
      anthropicKey,
      alphaVantageKey,
      isLoading,
      updateUserProfile,
      addPosition,
      removePosition,
      addChatMessage,
      clearChatHistory,
      setAnthropicKey,
      setAlphaVantageKey,
      markLessonComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
