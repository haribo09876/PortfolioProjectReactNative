import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import IntroPage from '../pages/IntroPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="IntroPage" component={IntroPage} />
      <Stack.Screen name="LoginPage" component={LoginPage} />
      <Stack.Screen name="SignupPage" component={SignupPage} />
      <Stack.Screen name="HomePage" component={HomePage} />
    </Stack.Navigator>
  );
};

export default StackNavigator;