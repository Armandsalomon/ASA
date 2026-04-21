import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/theme';

import OnboardingScreen from '../screens/OnboardingScreen';
import RiskProfileScreen from '../screens/RiskProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdvisorScreen from '../screens/AdvisorScreen';
import MarketScreen from '../screens/MarketScreen';
import NewsScreen from '../screens/NewsScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import EducationScreen from '../screens/EducationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import LessonScreen from '../screens/LessonScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  RiskProfile: undefined;
  Main: undefined;
  Settings: undefined;
  StockDetail: { ticker: string };
  Lesson: { lessonId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Advisor: undefined;
  Market: undefined;
  Portfolio: undefined;
  Education: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Advisor"
        component={AdvisorScreen}
        options={{
          tabBarLabel: 'Conseiller',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarLabel: 'Marchés',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarLabel: 'Portefeuille',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Education"
        component={EducationScreen}
        options={{
          tabBarLabel: 'Formation',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { userProfile, isLoading } = useApp();

  if (isLoading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userProfile.hasCompletedOnboarding ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="RiskProfile" component={RiskProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="StockDetail"
            component={StockDetailScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="Lesson"
            component={LessonScreen}
            options={{ presentation: 'card' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
