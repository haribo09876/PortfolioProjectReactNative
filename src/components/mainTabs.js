import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import HomePage from '../pages/HomePage';
import TweetPage from '../pages/TweetPage';
import InstaPage from '../pages/InstaPage';
import ShopPage from '../pages/ShopPage';

const Tab = createMaterialTopTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarIndicatorStyle: {backgroundColor: 'black'},
      tabBarLabelStyle: {fontSize: 12},
      tabBarStyle: {backgroundColor: '#fff'},
    }}>
    <Tab.Screen name="HomePage" component={HomePage} />
    <Tab.Screen name="TweetPage" component={TweetPage} />
    <Tab.Screen name="InstaPage" component={InstaPage} />
    <Tab.Screen name="ShopPage" component={ShopPage} />
  </Tab.Navigator>
);

export default MainTabs;
