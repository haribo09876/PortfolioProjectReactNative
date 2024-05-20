import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import HomePage from '../pages/HomePage';
import TweetPage from '../pages/TweetPage';
import InstaPage from '../pages/InstaPage';
import ShopPage from '../pages/ShopPage';
import {StyleSheet, Text, View} from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function () {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Text style={styles.text}>PPRN</Text>
      </View>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomePage} />
        <Tab.Screen name="Tweet" component={TweetPage} />
        <Tab.Screen name="Insta" component={InstaPage} />
        <Tab.Screen name="Shop" component={ShopPage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
