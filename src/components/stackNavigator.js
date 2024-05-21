import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import IntroPage from '../pages/IntroPage';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="IntroPage" component={IntroPage} />
      <Stack.Screen name="LoginPage" component={LoginPage} />
      <Stack.Screen name="SignupPage" component={SignupPage} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
