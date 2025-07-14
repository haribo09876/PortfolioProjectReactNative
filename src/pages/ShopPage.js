import React, {useState, useEffect} from 'react';
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
import {ADMIN_EMAIL} from '@env';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ShopTimeline from '../components/shopTimeline';

const ShopPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDetail, setItemDetail] = useState('');
  const [file, setFile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Get current authenticated user (현재 로그인한 사용자 정보 가져오기)
    const user = auth().currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  // Title input handler (상품 제목 입력 핸들러)
  const onChangeItemTitle = text => {
    setItemTitle(text);
  };

  // Price input handler (상품 가격 입력 핸들러)
  const onChangeItemPrice = text => {
    setItemPrice(Number(text));
  };

  // Detail input handler (상품 상세 설명 입력 핸들러)
  const onChangeItemDetail = text => {
    setItemDetail(text);
  };

  // Handle image picker response (이미지 선택 결과 처리)
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

  // Trigger image selection (이미지 선택 트리거)
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

  // Clear selected image (선택한 이미지 제거)
  const clearFile = () => {
    setFile(null);
  };

  // Submit post to Firestore and optionally upload image (Firestore에 게시물 등록 및 이미지 업로드)
  const onSubmit = async () => {
    const user = auth().currentUser;
    if (!user || isLoading || itemTitle === '' || itemTitle.length > 500) {
      return;
    }
    try {
      setLoading(true);
      const shopRef = firestore().collection('shops').doc(); // Create new doc ref (새 문서 참조 생성)
      const shopData = {
        itemTitle,
        itemPrice,
        itemDetail,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: user.displayName || 'Anonymous',
        userId: user.uid,
      };
      await shopRef.set(shopData); // Save item data (상품 정보 저장)

      if (file) {
        const storageRef = storage().ref(`shops/${user.uid}/${shopRef.id}`); // Storage path per user/item (사용자/아이템 경로)
        const uploadTask = storageRef.putFile(file.uri); // Upload image file (이미지 업로드)
        uploadTask.on(
          'state_changed',
          snapshot => {}, // Optional: monitor progress (선택사항: 진행률 모니터링)
          error => {
            console.error('Image upload error: ', error);
            Alert.alert(
              'Upload Error',
              'There was an error uploading the image.',
            );
          },
          async () => {
            const url = await storageRef.getDownloadURL(); // Get image URL (이미지 URL 가져오기)
            await shopRef.update({photo: url}); // Update document with image URL (문서에 이미지 URL 추가)
            setFile(null);
          },
        );
      } else {
        setFile(null);
      }
      setItemTitle('');
      setItemPrice('');
      setItemDetail('');
      setModalVisible(false); // Close modal after submission (제출 후 모달 닫기)
    } catch (error) {
      console.error('Shop submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your shop.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal (모달 열기)
  const openModal = () => {
    setModalVisible(true);
  };

  // Close modal and reset form (모달 닫고 폼 초기화)
  const closeModal = () => {
    setItemTitle('');
    setItemPrice('');
    setItemDetail('');
    setFile(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Item post modal (상품 등록 모달) */}
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
                  <Text style={styles.title}>Post item</Text>
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
                      style={styles.textItemTitleInput}
                      onChangeText={onChangeItemTitle}
                      value={itemTitle}
                      placeholder="Item title"
                      placeholderTextColor="rgba(89, 89, 89, 1)"
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={50}
                      multiline
                    />
                    <TextInput
                      style={styles.textItemPriceInput}
                      onChangeText={onChangeItemPrice}
                      value={itemPrice}
                      placeholder="Item price"
                      placeholderTextColor="rgba(89, 89, 89, 1)"
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={9}
                      keyboardType="numeric"
                      multiline
                    />
                    <TextInput
                      style={styles.textItemDetailInput}
                      onChangeText={onChangeItemDetail}
                      value={itemDetail}
                      placeholder="Item contents"
                      placeholderTextColor="rgba(89, 89, 89, 1)"
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={500}
                      multiline
                    />
                    {/* Preview selected image (선택 이미지 미리보기) */}
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
                      disabled={
                        !itemTitle || !itemPrice || !itemDetail || isLoading
                      }>
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
      {/* Render shop timeline (상점 타임라인 렌더링) */}
      <ShopTimeline />
      {/* Admin-only "Add item" button (관리자 전용 아이템 추가 버튼) */}
      {userEmail === ADMIN_EMAIL && (
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>Add item</Text>
        </TouchableOpacity>
      )}
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
  textItemTitleInput: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 16,
    height: 80,
    borderColor: 'rgba(89, 89, 89, 1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  textItemPriceInput: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 16,
    height: 60,
    borderColor: 'rgba(89, 89, 89, 1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  textItemDetailInput: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 16,
    height: 150,
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
    height: 350,
    borderRadius: 20,
    marginBottom: 10,
  },
});

export default ShopPage;
