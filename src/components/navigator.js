import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
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
import CompletionPage from '../pages/CompletionPage';
import DashboardPage from '../pages/DashboardPage';
import UserPage from '../pages/UserPage';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarIndicatorStyle: {backgroundColor: 'black'},
      tabBarLabelStyle: {
        fontSize: 15,
        fontWeight: '500',
        textTransform: 'none',
      },
      tabBarStyle: {backgroundColor: 'rgba(255, 255, 255, 1)'},
    }}>
    <Tab.Screen
      name="HomePage"
      component={HomePage}
      options={{title: 'Home'}}
    />
    <Tab.Screen
      name="TweetPage"
      component={TweetPage}
      options={{title: 'Tweet'}}
    />
    <Tab.Screen
      name="InstaPage"
      component={InstaPage}
      options={{title: 'Insta'}}
    />
    <Tab.Screen
      name="ShopPage"
      component={ShopPage}
      options={{title: 'Shop'}}
    />
  </Tab.Navigator>
);

const Navigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber;
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setModalVisible(false);
      navRef.current?.replace('LoginPage');
    } catch (error) {
      Alert.alert('Logout error', 'Problem while logout');
    }
  };

  if (initializing) return <LoadingScreen />;

  return (
    <>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'MainTabs' : 'IntroPage'}
        screenOptions={{
          headerStyle: {backgroundColor: 'white'},
        }}>
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
          options={{title: 'Sign up'}}
        />
        <Stack.Screen name="CompletionPage" component={CompletionPage} />
        <Stack.Screen name="DashboardPage" component={DashboardPage} />
        <Stack.Screen name="UserPage" component={UserPage} />
        <Stack.Screen
          name="MainTabs"
          options={{
            headerTitle: 'PPRN',
            headerTitleAlign: 'center',
            headerTitleStyle: {fontSize: 25},
            headerLeft: null,
            headerRight: () => (
              <View style={styles.headerButtonsContainer}>
                <TouchableOpacity
                  onPress={() => navRef.current?.navigate('UserPage')}
                  style={[styles.buttonContainer, styles.iconButton]}>
                  <Icon
                    name="account-outline"
                    size={25}
                    color="rgba(89, 89, 89, 1)"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={styles.buttonContainer}>
                  <Icon name="logout" size={20} color="rgba(89, 89, 89, 1)" />
                </TouchableOpacity>
              </View>
            ),
          }}>
          {props => {
            navRef.current = props.navigation;
            return <MainTabs {...props} />;
          }}
        </Stack.Screen>
      </Stack.Navigator>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Log out</Text>
                </View>
                <Text style={styles.confirmText}>
                  Are you sure you want to log out?
                </Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleLogout}>
                  <Text style={styles.confirmButtonText}>Log out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    height: 340,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(52, 52, 52, 1)',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(52, 52, 52, 1)',
    marginVertical: 70,
    alignSelf: 'center',
  },
  confirmButton: {
    backgroundColor: 'rgba(240, 68, 82, 1)',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'rgba(242, 242, 242, 1)',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default Navigator;
