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

const Navigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  const handleAuthStateChanged = user => {
    setIsLoggedIn(!!user);
    if (initializing) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <Stack.Screen name="MainTabs" options={{headerTitle: 'PPRN'}}>
          {() => (
            <>
              <Tab.Navigator>
                <Tab.Screen name="Home" component={HomePage} />
                <Tab.Screen name="Tweet" component={TweetPage} />
                <Tab.Screen name="Insta" component={InstaPage} />
                <Tab.Screen name="Shop" component={ShopPage} />
              </Tab.Navigator>
            </>
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Intro" component={IntroPage} />
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Signup" component={SignupPage} />
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

export default Navigator;
