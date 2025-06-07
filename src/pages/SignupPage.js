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
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function SignUpPage() {
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNameChange = text => setName(text);
  const handleEmailChange = text => setEmail(text);
  const handlePasswordChange = text => setPassword(text);

  async function createInitialMoneyData(username, userEmail) {
    try {
      const moneyRef = firestore().collection('moneys').doc();
      const moneyData = {
        money: 1000000,
        spend: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username,
        userEmail,
      };
      await moneyRef.set(moneyData);
    } catch (error) {
      console.error('Error adding initial money data:', error);
      Alert.alert('Error', 'Failed to set up your initial balance.');
    }
  }

  const onFileChange = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    };
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('Image selection cancelled');
      } else if (response.errorCode) {
        console.error('ImagePicker error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setAvatar(selectedImage.uri);
      }
    });
  };

  const removeImage = () => {
    setAvatar(null);
  };

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Input Error', 'Please fill out all fields.');
      return;
    }
    try {
      const credentials = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = credentials.user;

      let uploadedAvatar = null;
      await auth().currentUser.reload();

      if (avatar) {
        try {
          const storageRef = storage().ref(`avatars/${user.uid}`);
          await storageRef.putFile(avatar);
          uploadedAvatar = await storageRef.getDownloadURL();
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert('Upload Error', 'Failed to upload profile image.');
        }
      }

      await user.updateProfile({
        displayName: name,
        photoURL: uploadedAvatar,
      });

      await createInitialMoneyData(name, email);

      Alert.alert('Success', 'You have successfully signed up.');
      navigation.navigate('LoginPage');
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {avatar ? (
        <View style={styles.imagePreview}>
          <Image source={{uri: avatar}} style={styles.avatarImg} />
        </View>
      ) : (
        <MaterialCommunityIcons
          name="account-circle"
          style={styles.avatarIcon}
        />
      )}
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
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="Password"
        placeholderTextColor="rgba(89, 89, 89, 1)"
        style={styles.inputBox}
        secureTextEntry={true}
      />
      {avatar && (
        <TouchableOpacity style={styles.imageButton} onPress={removeImage}>
          <Text style={styles.imageButtonText}>Remove image</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.imageButton} onPress={onFileChange}>
        <Text style={styles.imageButtonText}>Add image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
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
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarIcon: {
    fontSize: 100,
    color: 'gray',
  },
  imagePreview: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: 'rgba(242, 242, 242, 1)',
    width: 340,
    height: 45,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
  inputBox: {
    width: 340,
    backgroundColor: 'white',
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#595959',
  },
  button: {
    backgroundColor: '#4458C8',
    width: 340,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SignUpPage;
