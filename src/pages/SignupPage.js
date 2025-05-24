import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {auth} from '../firebase';
import storage from '@react-native-firebase/storage';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function SignUpPage() {
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState(user?.photoURL);
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
  const onAvatarChange = async () => {
    if (!user) {
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageResponse = await fetch(asset.uri);
        const blob = await imageResponse.blob();
        const storageRef = storage().ref().child(`avatars/${user?.uid}`);

        try {
          const uploadTask = storageRef.put(blob);
          uploadTask.on(
            'state_changed',
            null,
            error => {
              console.error('Error uploading image: ', error);
            },
            async () => {
              try {
                const downloadURL = await storageRef.getDownloadURL();
                setAvatar(downloadURL);
                await auth().currentUser.updateProfile({photoURL: downloadURL});
              } catch (error) {
                console.error('Error getting download URL: ', error);
              }
            },
          );
        } catch (error) {
          console.error('Error uploading image: ', error);
        }
      }
    });
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
      Money();
      navigation.navigate('LoginPage');
    } catch (error) {
      console.error('Firebase 에러:', error);
      Alert.alert('회원가입에 실패했습니다. 다시 시도해주세요');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarUpload} onPress={onAvatarChange}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.avatarImg} />
        ) : (
          <MaterialCommunityIcons
            name="account-circle"
            style={styles.avatarIcon}
          />
        )}
      </TouchableOpacity>
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
  avatarUpload: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarIcon: {
    color: 'gray',
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
    backgroundColor: 'rgba(68, 88, 200, 1)',
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
