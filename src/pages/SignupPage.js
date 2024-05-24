import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

function SignUpPage() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNameChange = text => {
    setName(text);
  };

  const handleEmailChange = text => {
    setEmail(text);
  };

  const handlePasswordChange = text => {
    setPassword(text);
  };

  const onSubmit = async () => {
    if (name === '' || email === '' || password === '') {
      Alert.alert('모든 필드를 채워주세요');
      return;
    }
    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(credentials.user, {displayName: name});
      Alert.alert('회원가입에 성공했습니다');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Firebase 에러:', error);
      Alert.alert('회원가입에 실패했습니다. 다시 시도해주세요');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={name}
        onChangeText={handleNameChange}
        placeholder="이름"
        style={styles.inputBox}
      />
      <TextInput
        value={email}
        onChangeText={handleEmailChange}
        placeholder="이메일"
        style={styles.inputBox}
      />
      <TextInput
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="비밀번호"
        style={styles.inputBox}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>가입하기</Text>
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
});

export default SignUpPage;
