import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import IntroPage from './pages/IntroPage';
import {SafeAreaView} from 'react-native';

export default function App() {
  return (
    <NavigationContainer>
      <IntroPage />
      <SafeAreaView />
    </NavigationContainer>
  );
}
