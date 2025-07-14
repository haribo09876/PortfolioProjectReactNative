import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
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
  // User authentication state management (사용자 인증 상태 관리)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Loading state for auth initialization (인증 초기화 로딩 상태)
  const [initializing, setInitializing] = useState(true);
  // Modal visibility state for logout confirmation (로그아웃 확인 모달 가시성 상태)
  const [modalVisible, setModalVisible] = useState(false);
  // Navigation ref for programmatic navigation control (프로그래매틱 내비게이션 제어용 참조)
  const navRef = useRef(null);

  useEffect(() => {
    // Firebase auth listener for realtime auth state updates (Firebase 인증 상태 실시간 구독)
    const subscriber = auth().onAuthStateChanged(user => {
      setIsLoggedIn(!!user); // Boolean casting user object (user 객체를 불리언으로 변환)
      if (initializing) {
        setInitializing(false); // Disable loading once initialized (초기화 완료 시 로딩 종료)
      }
    });
    return subscriber; // Cleanup subscription on unmount (언마운트 시 구독 해제)
  }, [initializing]);

  // Sign out function with error handling (로그아웃 함수 및 에러 핸들링)
  const handleLogout = async () => {
    try {
      await auth().signOut();
      setModalVisible(false);
      navRef.current?.replace('LoginPage'); // Navigate to LoginPage after logout (로그아웃 후 로그인 페이지로 이동)
    } catch (error) {
      Alert.alert('Logout error', 'Problem while logout'); // Display alert on logout failure (로그아웃 실패 시 알림)
    }
  };

  if (initializing) return <LoadingScreen />; // Show loading screen while auth initializing (인증 초기화 중 로딩 화면 표시)

  return (
    <>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'MainTabs' : 'IntroPage'} // Conditional initial route based on login state (로그인 상태에 따른 초기 화면 분기)
        screenOptions={{
          headerStyle: {backgroundColor: 'white'},
        }}>
        <Stack.Screen
          name="IntroPage"
          component={IntroPage}
          options={{headerShown: false}} // Hide header for intro (인트로 페이지 헤더 숨김)
        />
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{headerShown: false}} // Hide header for login (로그인 페이지 헤더 숨김)
        />
        <Stack.Screen
          name="SignupPage"
          component={SignupPage}
          options={{
            title: 'Sign up',
            headerTitleAlign: 'center', // Center-align header title (헤더 제목 중앙 정렬)
          }}
        />
        <Stack.Screen
          name="UserPage"
          component={UserPage}
          options={{
            title: 'User page',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="DashboardPage"
          component={DashboardPage}
          options={{
            title: 'Dashboard page',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="MainTabs"
          options={{
            headerTitle: 'PPRN', // App title in header (앱 제목 표시)
            headerTitleAlign: 'center',
            headerTitleStyle: {fontSize: 25}, // Large font for header title (헤더 제목 폰트 크기)
            headerLeft: null, // Remove back button (뒤로가기 버튼 제거)
            headerRight: () => (
              <View style={styles.headerButtonsContainer}>
                {/* Navigate to UserPage */}
                <TouchableOpacity
                  onPress={() => navRef.current?.navigate('UserPage')}
                  style={[styles.buttonContainer, styles.iconButton]}>
                  <Icon
                    name="account-outline"
                    size={25}
                    color="rgba(89, 89, 89, 1)"
                  />
                </TouchableOpacity>
                {/* Trigger logout modal */}
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={styles.buttonContainer}>
                  <Icon name="logout" size={20} color="rgba(89, 89, 89, 1)" />
                </TouchableOpacity>
              </View>
            ),
          }}>
          {/* Assign navigation ref and render MainTabs */}
          {props => {
            navRef.current = props.navigation;
            return <MainTabs {...props} />;
          }}
        </Stack.Screen>
      </Stack.Navigator>
      {/* Logout confirmation modal overlay */}
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
                {/* Confirm logout button */}
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleLogout}>
                  <Text style={styles.confirmButtonText}>Log out</Text>
                </TouchableOpacity>
                {/* Cancel logout button */}
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
