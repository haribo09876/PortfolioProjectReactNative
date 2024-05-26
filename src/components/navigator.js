import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '../firebase'; // Firebase 설정을 임포트해야 합니다.
import IntroPage from '../pages/IntroPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import LoadingScreen from './loadingScreen';
import MainTabs from './mainTabs';

const Stack = createStackNavigator();

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
      navigation.navigate('LoginPage');
    } catch (error) {
      Alert.alert('로그아웃 에러', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
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
            options={({navigation}) => ({
              headerTitle: 'PPRN',
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
                    <Text style={styles.buttonText}>Log Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => alert('To User Page')}
                    style={styles.buttonContainer}>
                    <Text style={styles.buttonText}>User Page</Text>
                  </TouchableOpacity>
                </View>
              ),
            })}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginRight: 10,
  },
  buttonText: {
    color: 'orange',
    fontSize: 16,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
});

export default Navigator;
