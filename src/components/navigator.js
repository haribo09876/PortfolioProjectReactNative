import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '../firebase';
import IntroPage from '../pages/IntroPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import TweetPage from '../pages/TweetPage';
import InstaPage from '../pages/InstaPage';
import ShopPage from '../pages/ShopPage';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="HomePage" component={HomePage} />
    <Tab.Screen name="TweetPage" component={TweetPage} />
    <Tab.Screen name="InstaPage" component={InstaPage} />
    <Tab.Screen name="ShopPage" component={ShopPage} />
  </Tab.Navigator>
);

const Navigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber;
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerTitle: 'PPRN'}}
          />
          <Stack.Screen
            name="LoginPage"
            component={LoginPage}
            options={{headerShown: false}}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="IntroPage"
            component={IntroPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="LoginPage"
            component={LoginPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SignupPage"
            component={SignupPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerShown: false}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Navigator;
