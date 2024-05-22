import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaView} from 'react-native';
import StackNavigator from './navigation/stackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
      <SafeAreaView />
    </NavigationContainer>
  );
}
