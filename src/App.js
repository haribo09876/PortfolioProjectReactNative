import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaView, StatusBar} from 'react-native';
import Navigator from './components/navigator';

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
