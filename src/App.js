import React from 'react';
import Navigator from './components/navigator';
import {SafeAreaView, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor="rgba(255, 255, 255, 1)"
        barStyle="dark-content"
      />
      <SafeAreaView style={{flex: 1}}>
        <Navigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}
