import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

function LoginPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PPRN</Text>
      <TextInput style={styles.inputBox} placeholder="  아이디를 입력하세요" />
      <TextInput
        secureTextEntry={true}
        style={styles.inputBox}
        placeholder="  비밀번호를 입력하세요"
      />
      <TouchableOpacity style={styles.button}>
        <Text
          style={styles.buttonText}
          onPress={() => navigation.navigate('HomePage')}>
          로그인
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.altButton]}>
        <Text style={styles.buttonText}>Google로 로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.altButton]}>
        <Text style={styles.buttonText}>Github로 로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => navigation.navigate('SignupPage')}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  inputBox: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 25,
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#3498db',
    width: 250,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  altButton: {
    backgroundColor: '#74b9ff',
  },
  signupButton: {
    backgroundColor: '#2ecc71',
  },
});

export default LoginPage;
