import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import HomePage from '../pages/HomePage';
import TweetPage from '../pages/TweetPage';
import InstaPage from '../pages/InstaPage';
import ShopPage from '../pages/ShopPage';

const Tab = createMaterialTopTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomePage" component={HomePage} />
      <Tab.Screen name="TweetPage" component={TweetPage} />
      <Tab.Screen name="InstaPage" component={InstaPage} />
      <Tab.Screen name="ShopPage" component={ShopPage} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
