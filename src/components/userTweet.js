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
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import UserTweetTimeline from '../components/userTweetTimeline';

const UserTweet = () => {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState('');
  const [file, setFile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const onChange = text => {
    setTweet(text); // Update tweet content (트윗 내용 갱신)
  };

  // Handle image picker result (이미지 선택 결과 처리)
  const handleImageResult = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker'); // User cancelled (사용자 취소)
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
          setFile(selectedAsset); // Valid image (유효한 이미지)
        }
      }
    }
  };

  // Trigger image picker (이미지 선택창 실행)
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
      {cancelable: true}, // Dismissable modal (취소 가능)
    );
  };

  const clearFile = () => {
    setFile(null); // Remove selected image (이미지 제거)
  };

  // Handle tweet submission with optional image upload (트윗 및 이미지 업로드 처리)
  const onSubmit = async () => {
    const user = auth().currentUser; // Get current user (현재 로그인 사용자)
    if (!user || isLoading || tweet === '' || tweet.length > 180) return;

    try {
      setLoading(true);
      const tweetRef = firestore().collection('tweets').doc(); // Generate tweet document (트윗 문서 생성)
      const tweetData = {
        tweet,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: user.displayName || 'Anonymous', // Fallback username (기본 사용자 이름)
        userId: user.uid,
        modifiedAt: firestore.FieldValue.serverTimestamp(),
      };
      await tweetRef.set(tweetData); // Store tweet in Firestore (트윗 저장)

      if (file) {
        const storageRef = storage().ref(`tweets/${user.uid}/${tweetRef.id}`); // Image path in Firebase Storage (이미지 저장 경로)
        const uploadTask = storageRef.putFile(file.uri); // Upload image file (이미지 업로드)
        uploadTask.on(
          'state_changed',
          snapshot => {}, // No progress callback (진행 콜백 없음)
          error => {
            console.error('Image upload error: ', error);
            Alert.alert(
              'Upload Error',
              'There was an error uploading the image.',
            );
          },
          async () => {
            const url = await storageRef.getDownloadURL(); // Get image URL (이미지 URL 가져오기)
            await tweetRef.update({photo: url}); // Attach URL to tweet (트윗에 URL 연결)
            setFile(null); // Reset file state (파일 상태 초기화)
          },
        );
      }
      setTweet(''); // Clear input (입력 초기화)
      setModalVisible(false);
    } catch (error) {
      console.error('Tweet submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your tweet.',
      );
    } finally {
      setLoading(false); // End submission (제출 종료)
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
                  value={tweet}
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
                    title={isLoading ? 'Posting...' : 'Post Tweet'}
                    onPress={onSubmit}
                    disabled={!tweet || isLoading} // Disable if empty or loading (빈 입력 또는 로딩 중 비활성화)
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
      <UserTweetTimeline />
      {/* Display tweet list (트윗 타임라인 표시) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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

export default UserTweet;
