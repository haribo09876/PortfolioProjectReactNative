import React from 'react';
import Navigator from './components/navigator';
import {SafeAreaView, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

export default function App() {
  return (
    // Root navigation container for screen management (화면 전환을 관리하는 최상위 네비게이션 컨테이너)
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
