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
  TouchableWithoutFeedback,
  Text,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TweetTimeline from '../components/tweetTimeline';

const TweetPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState('');
  const [file, setFile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const onChange = text => {
    setTweet(text); // Update tweet content (트윗 내용 갱신)
  };

  const handleImageResult = response => {
    // Handle image picker result (이미지 선택 결과 처리)
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      Alert.alert('ImagePicker Error', response.errorMessage);
    } else {
      const selectedAsset = response.assets[0];
      if (selectedAsset.uri) {
        const fileSizeInMB = selectedAsset.fileSize / (1024 * 1024);
        if (fileSizeInMB > 3) {
          // Enforce file size limit (파일 크기 제한)
          Alert.alert(
            'File size error',
            'The selected image exceeds the 3MB size limit.',
          );
        } else {
          setFile(selectedAsset); // Save valid image file (유효한 이미지 파일 저장)
        }
      }
    }
  };

  const onFileChange = () => {
    // Prompt for image source selection (이미지 소스 선택 알림)
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
            handleImageResult(result); // Handle captured image (촬영된 이미지 처리)
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await launchImageLibrary({mediaType: 'photo'});
            handleImageResult(result); // Handle selected image (선택된 이미지 처리)
          },
        },
      ],
      {cancelable: true},
    );
  };

  const clearFile = () => {
    setFile(null); // Reset selected file (선택된 파일 초기화)
  };

  const onSubmit = async () => {
    // Submit tweet (트윗 전송 처리)
    const user = auth().currentUser;
    if (!user || isLoading || tweet === '' || tweet.length > 500) {
      return; // Validation check (검증 검사)
    }

    try {
      setLoading(true); // Begin loading state (로딩 상태 시작)
      const tweetRef = firestore().collection('tweets').doc(); // Generate tweet document ref (트윗 문서 참조 생성)
      const tweetData = {
        tweet,
        createdAt: firestore.FieldValue.serverTimestamp(), // Server-side timestamp (서버 타임스탬프)
        username: user.displayName || 'Anonymous',
        userId: user.uid,
      };
      await tweetRef.set(tweetData); // Save tweet metadata (트윗 메타데이터 저장)

      if (file) {
        // If image is attached (이미지가 첨부된 경우)
        const storageRef = storage().ref(`tweets/${user.uid}/${tweetRef.id}`); // Define storage path (스토리지 경로 정의)
        const uploadTask = storageRef.putFile(file.uri); // Upload image (이미지 업로드)
        uploadTask.on(
          'state_changed',
          snapshot => {}, // Optional progress handler (선택적 진행 핸들러)
          error => {
            // Handle upload error (업로드 에러 처리)
            console.error('Image upload error: ', error);
            Alert.alert(
              'Upload Error',
              'There was an error uploading the image.',
            );
          },
          async () => {
            // On successful upload (업로드 성공 시)
            const url = await storageRef.getDownloadURL(); // Get image URL (이미지 URL 획득)
            await tweetRef.update({photo: url}); // Update tweet with image URL (이미지 URL 포함 트윗 갱신)
            setFile(null);
          },
        );
      } else {
        setFile(null); // No image, just clear state (이미지 없을 경우 상태 초기화)
      }

      setTweet(''); // Reset tweet input (트윗 입력 초기화)
      setModalVisible(false); // Close modal (모달 닫기)
    } catch (error) {
      // Submission error handler (트윗 전송 에러 처리)
      console.error('Tweet submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your tweet.',
      );
    } finally {
      setLoading(false); // End loading state (로딩 상태 종료)
    }
  };

  const openModal = () => {
    setModalVisible(true); // Show modal (모달 표시)
  };

  const closeModal = () => {
    // Reset modal states (모달 상태 초기화)
    setTweet('');
    setFile(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Post tweet</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <MaterialCommunityIcons
                      name="close"
                      size={25}
                      color="rgba(89, 89, 89, 1)"
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={onChange}
                      value={tweet}
                      placeholder="What's happening?"
                      placeholderTextColor="rgba(89, 89, 89, 1)"
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={500}
                      multiline
                    />
                    {file && (
                      <View style={styles.imagePreview}>
                        <Image source={{uri: file.uri}} style={styles.image} />
                        <TouchableOpacity
                          style={styles.imageButton}
                          onPress={clearFile}>
                          <Text style={styles.imageButtonText}>
                            Remove image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.imageButton}
                      onPress={onFileChange}>
                      <Text style={styles.imageButtonText}>Add image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.postButton}
                      onPress={onSubmit}
                      disabled={!tweet || isLoading}>
                      <Text style={styles.postButtonText}>
                        {isLoading ? 'Posting...' : 'Post'}
                      </Text>
                    </TouchableOpacity>
                    {isLoading && (
                      <ActivityIndicator size="large" color="#1DA1F2" />
                    )}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <TweetTimeline /> {/* Render tweet feed (트윗 타임라인 렌더링) */}
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add tweet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  addButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 340,
    height: 45,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 20,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    height: 600,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  iconCloseButton: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    marginVertical: 10,
  },
  textInput: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 16,
    height: 100,
    borderColor: 'rgba(89, 89, 89, 1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginBottom: 50,
  },
  imageButton: {
    backgroundColor: 'rgba(242, 242, 242, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  imagePreview: {
    marginBottom: 10,
  },
  image: {
    width: 280,
    height: 200,
    borderRadius: 20,
    marginBottom: 10,
  },
});

export default TweetPage;
