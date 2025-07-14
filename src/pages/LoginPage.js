import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {GOOGLE_SIGNIN_WEB_CLIENT_ID} from '@env';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

function LoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle email/password authentication (이메일/비밀번호 로그인 처리)
  const handleLogin = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        navigation.navigate('MainTabs');
      })
      .catch(error => {
        Alert.alert('로그인 실패', error.message);
      });
  };

  // Configure Google Sign-In on component mount (Google 로그인 초기 설정)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_SIGNIN_WEB_CLIENT_ID, // OAuth 클라이언트 ID (웹용) 설정
    });
  }, []);

  // Handle Google OAuth authentication (Google OAuth 인증 처리)
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices(); // Google Play 서비스 사용 가능 여부 확인
      const userInfo = await GoogleSignin.signIn(); // 사용자 Google 계정 로그인
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken, // Firebase 인증용 자격 증명 생성
      );
      await auth().signInWithCredential(googleCredential); // Firebase 인증 완료
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('로그인 실패', 'Google 로그인에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PPRN</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Email"
        placeholderTextColor="rgba(89, 89, 89, 1)"
        value={email}
        onChangeText={setEmail} // 입력값 상태 업데이트
      />
      <TextInput
        secureTextEntry={true}
        style={styles.inputBox}
        placeholder="Password"
        placeholderTextColor="rgba(89, 89, 89, 1)"
        value={password}
        onChangeText={setPassword} // 입력값 상태 업데이트
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Log in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.signupButton]}
        onPress={() => navigation.navigate('SignupPage')}>
        <Text style={styles.signupButtonText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '500',
    color: '#333',
    marginTop: 120,
    marginBottom: 40,
  },
  inputBox: {
    width: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(89, 89, 89, 1)',
  },
  button: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 340,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'rgba(18, 172, 120, 1)',
    width: 340,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: 'rgba(242, 242, 242, 1)',
    width: 340,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  signupButtonText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default LoginPage;
