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

  // Input change handlers (입력 핸들러)
  const handleNameChange = text => setName(text);
  const handleEmailChange = text => setEmail(text);
  const handlePasswordChange = text => setPassword(text);

  // Initialize user balance data in Firestore (초기 자산 데이터 생성)
  async function createInitialMoneyData(username, userEmail) {
    try {
      const moneyRef = firestore().collection('moneys').doc(); // Firestore document reference (도큐먼트 참조)
      const moneyData = {
        money: 1000000,
        spend: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username,
        userEmail,
      };
      await moneyRef.set(moneyData); // Write to Firestore (파이어스토어에 저장)
    } catch (error) {
      console.error('Error adding initial money data:', error);
      Alert.alert('Error', 'Failed to set up your initial balance.');
    }
  }

  // Image selection handler (이미지 선택 핸들러)
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

  // Remove selected image (선택한 이미지 제거)
  const removeImage = () => {
    setAvatar(null);
  };

  // Submit signup form (회원가입 처리)
  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Input Error', 'Please fill out all fields.');
      return;
    }
    try {
      // Create user with Firebase Auth (Firebase 인증으로 사용자 생성)
      const credentials = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = credentials.user;

      let uploadedAvatar = null;
      await auth().currentUser.reload(); // Refresh user session (유저 세션 새로고침)

      // Upload avatar to Firebase Storage (프로필 이미지 업로드)
      if (avatar) {
        try {
          const storageRef = storage().ref(`avatars/${user.uid}`); // User-specific storage path (UID 기준 경로)
          await storageRef.putFile(avatar); // Upload image (이미지 업로드)
          uploadedAvatar = await storageRef.getDownloadURL(); // Get public URL (다운로드 URL 가져오기)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert('Upload Error', 'Failed to upload profile image.');
        }
      }

      // Update user profile with name and photo (프로필 정보 업데이트)
      await user.updateProfile({
        displayName: name,
        photoURL: uploadedAvatar,
      });

      // Set initial financial data (초기 재무 데이터 설정)
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
