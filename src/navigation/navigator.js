import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import HomePage from '../pages/HomePage';
import TweetPage from '../pages/TweetPage';
import InstaPage from '../pages/InstaPage';
import {View, Text} from 'react-native-reanimated/lib/typescript/Animated';
import ShoppingPage from '../pages/ShoppingPage';

const Tab = createMaterialTopTabNavigator();

export default function () {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomePage} />
        <Tab.Screen name="Tweet" component={TweetPage} />
        <Tab.Screen name="Insta" component={InstaPage} />
        <Tab.Screen name="Shop" component={ShoppingPage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
