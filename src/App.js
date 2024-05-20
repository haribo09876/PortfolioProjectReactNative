import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  return (
    <>
      <SafeAreaView />
      <View style={styles.container}>
        <Text style={styles.text}>PPRN</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="   아이디를 입력하세요"
        />
        <TextInput
          style={styles.inputBox}
          placeholder="   비밀번호를 입력하세요"
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Google로 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Github로 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 70,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputBox: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    fontSize: 20,
    marginTop: 10,
  },
  button: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
