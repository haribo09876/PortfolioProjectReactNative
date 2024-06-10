import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '../firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IntroPage from '../pages/IntroPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import LoadingScreen from './loadingScreen';
import HomePage from '../pages/HomePage';
import TweetPage from '../pages/TweetPage';
import InstaPage from '../pages/InstaPage';
import ShopPage from '../pages/ShopPage';
import DashboardPage from '../pages/DashboardPage';
import UserPage from '../pages/UserPage';

const Stack = createStackNavigator();
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
    <Tab.Screen name="UserPage" component={UserPage} />
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

  const handleLogout = async navigation => {
    try {
      await auth.signOut();
      navigation.replace('LoginPage');
    } catch (error) {
      Alert.alert('로그아웃 에러', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'IntroPage'}>
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
      <Stack.Screen name="DashboardPage" component={DashboardPage} />
      <Stack.Screen name="UserPage" component={UserPage} />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={({navigation}) => ({
          headerTitle: 'PPRN',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 30,
            fontWeight: 'semi-bold',
          },
          headerLeft: null,
          headerRight: () => (
            <View style={styles.headerButtonsContainer}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => handleLogout(navigation),
                    },
                  ])
                }
                style={styles.buttonContainer}>
                <Icon name="logout" size={25} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('DashboardPage')}
                style={[styles.buttonContainer, styles.iconButton]}>
                <Icon name="view-dashboard" size={25} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserPage')}
                style={[styles.buttonContainer, styles.iconButton]}>
                <Icon name="account-circle" size={25} color="black" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginRight: 10,
    justifyContent: 'center',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
});

export default Navigator;
