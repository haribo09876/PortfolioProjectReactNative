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
import InstaTimeline from '../components/instaTimeline';

const InstaPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [insta, setInsta] = useState('');
  const [file, setFile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // Text input handler (텍스트 입력 핸들러)
  const onChange = text => {
    setInsta(text);
  };

  // Handle image selection result (이미지 선택 결과 처리)
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
          setFile(selectedAsset);
        }
      }
    }
  };

  // Launch image picker (이미지 선택 소스 선택 팝업)
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
            handleImageResult(result); // Handle camera result (카메라 결과 처리)
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await launchImageLibrary({mediaType: 'photo'});
            handleImageResult(result); // Handle gallery result (갤러리 결과 처리)
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Clear selected image (선택된 이미지 제거)
  const clearFile = () => {
    setFile(null);
  };

  // Upload post to Firestore (게시글 업로드 로직)
  const onSubmit = async () => {
    const user = auth().currentUser;
    if (!user || isLoading || insta === '' || insta.length > 500) {
      return;
    }

    try {
      setLoading(true);
      const instaRef = firestore().collection('instas').doc(); // Create Firestore document reference (문서 레퍼런스 생성)
      const instaData = {
        insta,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: user.displayName || 'Anonymous',
        userId: user.uid,
      };
      await instaRef.set(instaData); // Save text data (텍스트 데이터 저장)

      if (file) {
        const storageRef = storage().ref(`instas/${user.uid}/${instaRef.id}`); // Firebase Storage path (스토리지 경로)
        const uploadTask = storageRef.putFile(file.uri); // Start file upload (파일 업로드 시작)
        uploadTask.on(
          'state_changed',
          snapshot => {}, // Optional progress callback (옵션: 업로드 상태 콜백)
          error => {
            console.error('Image upload error: ', error);
            Alert.alert(
              'Upload Error',
              'There was an error uploading the image.',
            );
          },
          async () => {
            const url = await storageRef.getDownloadURL(); // Get download URL (이미지 다운로드 URL 가져오기)
            await instaRef.update({photo: url}); // Update Firestore with image URL (파이어스토어 문서에 이미지 URL 저장)
            setFile(null);
          },
        );
      } else {
        setFile(null);
      }
      setInsta('');
      setModalVisible(false);
    } catch (error) {
      console.error('Insta submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your insta.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal (모달 열기)
  const openModal = () => {
    setModalVisible(true);
  };

  // Close modal and reset form (모달 닫기 및 초기화)
  const closeModal = () => {
    setInsta('');
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
                  <Text style={styles.title}>Post insta</Text>
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
                    {file && (
                      <View style={styles.imagePreview}>
                        <Image source={{uri: file.uri}} style={styles.image} />
                      </View>
                    )}
                    <TextInput
                      style={styles.textInput}
                      onChangeText={onChange}
                      value={insta}
                      placeholder="What's happening?"
                      placeholderTextColor="rgba(89, 89, 89, 1)"
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={500}
                      multiline
                    />
                    {file && (
                      <View style={styles.imagePreview}>
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
                      disabled={!insta || isLoading}>
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
      {/* Timeline feed (게시글 타임라인 피드) */}
      <InstaTimeline />
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add insta</Text>
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
    height: 280,
    marginBottom: 10,
  },
});

export default InstaPage;
