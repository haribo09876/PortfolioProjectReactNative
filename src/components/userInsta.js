import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import UserInstaTimeline from '../components/userInstaTimeline';

const UserInsta = () => {
  const [isLoading, setLoading] = useState(false);
  const [insta, setInsta] = useState('');
  const [file, setFile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // Update text input state on user input (사용자 입력에 따른 텍스트 상태 업데이트)
  const onChange = text => {
    setInsta(text);
  };

  // Handle image picker response including validation (이미지 선택 응답 처리 및 유효성 검사)
  const handleImageResult = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      Alert.alert('ImagePicker Error', response.errorMessage);
    } else {
      const selectedAsset = response.assets[0];
      if (selectedAsset.uri) {
        const fileSizeInMB = selectedAsset.fileSize / (1024 * 1024);
        if (fileSizeInMB > 3) {
          Alert.alert(
            'File size error',
            'The selected image exceeds the 3MB size limit.',
          );
        } else {
          setFile(selectedAsset); // Set selected image to state (선택한 이미지 상태 저장)
        }
      }
    }
  };

  // Prompt user to select image source: camera or library (이미지 소스 선택 대화상자: 카메라 또는 갤러리)
  const onFileChange = () => {
    Alert.alert(
      'Select Image Source',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await launchCamera({
              mediaType: 'photo',
              cameraType: 'back',
            });
            handleImageResult(result);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await launchImageLibrary({mediaType: 'photo'});
            handleImageResult(result);
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Clear selected image from state (선택한 이미지 초기화)
  const clearFile = () => {
    setFile(null);
  };

  // Submit new insta post with optional image upload (새 인스타 게시물 제출 및 이미지 업로드 처리)
  const onSubmit = async () => {
    const user = auth().currentUser;
    if (!user || isLoading || insta === '' || insta.length > 180) return;

    try {
      setLoading(true);
      const instaRef = firestore().collection('instas').doc();
      const instaData = {
        insta,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: user.displayName || 'Anonymous',
        userId: user.uid,
        modifiedAt: firestore.FieldValue.serverTimestamp(),
      };
      await instaRef.set(instaData); // Create new document in Firestore (Firestore에 새 문서 생성)

      if (file) {
        const storageRef = storage().ref(`instas/${user.uid}/${instaRef.id}`);
        const uploadTask = storageRef.putFile(file.uri);
        // Monitor upload state and handle errors (업로드 상태 모니터링 및 에러 처리)
        uploadTask.on(
          'state_changed',
          snapshot => {},
          error => {
            console.error('Image upload error: ', error);
            Alert.alert(
              'Upload Error',
              'There was an error uploading the image.',
            );
          },
          async () => {
            const url = await storageRef.getDownloadURL(); // Get image URL from storage (스토리지에서 이미지 URL 획득)
            await instaRef.update({photo: url}); // Update Firestore doc with image URL (Firestore 문서에 이미지 URL 업데이트)
            setFile(null);
          },
        );
      }

      setInsta(''); // Reset text input after submission (제출 후 텍스트 입력 초기화)
      setModalVisible(false);
    } catch (error) {
      console.error('Insta submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your insta.',
      );
    } finally {
      setLoading(false); // Reset loading state (로딩 상태 해제)
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.iconCloseButton}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={32}
                color="#3A3A3A"
              />
            </TouchableOpacity>
            <ScrollView>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={onChange}
                  value={insta}
                  placeholder="내용을 입력하세요"
                  maxLength={180}
                  multiline
                />
                {file && (
                  <View style={styles.imagePreview}>
                    <Image source={{uri: file.uri}} style={styles.image} />
                    <Button title="Remove Image" onPress={clearFile} />
                  </View>
                )}
                <View style={styles.buttonContainer}>
                  <Button title="Add photo" onPress={onFileChange} />
                  <Button
                    title={isLoading ? 'Posting...' : 'Post Insta'}
                    onPress={onSubmit}
                    disabled={!insta || isLoading}
                  />
                </View>
                {isLoading && (
                  <ActivityIndicator size="large" color="#1DA1F2" />
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <UserInstaTimeline />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 10,
  },
  addButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#1DA1F2',
    borderRadius: 5,
    margin: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  iconCloseButton: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    marginVertical: 10,
  },
  textInput: {
    height: 200,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 30,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePreview: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
});

export default UserInsta;
