import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase';
import React, {useState} from 'react';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import firestore from '@react-native-firebase/firestore';
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

  async function Money() {
    try {
      const moneyRef = firestore().collection('moneys').doc();
      const moneyData = {
        money: Number(1000000),
        spend: Number(0),
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: name,
        userEmail: email,
      };
      await moneyRef.set(moneyData);
    } catch (error) {
      console.error('Money submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your money.',
      );
    }
  }

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
      Money();
      navigation.navigate('LoginPage');
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
        placeholder="Username"
        placeholderTextColor="rgba(89, 89, 89, 1)"
        style={styles.inputBox}
      />
      <TextInput
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Email"
        placeholderTextColor="rgba(89, 89, 89, 1)"
        style={styles.inputBox}
      />
      <TextInput
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="Password"
        placeholderTextColor="rgba(89, 89, 89, 1)"
        style={styles.inputBox}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    width: 360,
    backgroundColor: 'white',
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(89, 89, 89, 1)',
  },
  button: {
    backgroundColor: 'rgba(75, 127, 247, 1)',
    width: 360,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SignUpPage;
