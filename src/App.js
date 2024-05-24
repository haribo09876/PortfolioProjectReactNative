import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaView} from 'react-native';
import Navigator from './navigation/navigator';

export default function App() {
  return (
    <NavigationContainer>
      <Navigator />
      <SafeAreaView />
    </NavigationContainer>
  );
}
