import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {ADMIN_EMAIL} from '@env';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default function Tweet({
  username,
  avatar,
  tweet,
  photo,
  id,
  userId,
  onEdit,
  onDelete,
}) {
  const currentUser = auth().currentUser;
  const [newTweet, setNewTweet] = useState(tweet);
  const [newPhoto, setNewPhoto] = useState(photo);
  const [imageUri, setImageUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Delete tweet document and associated image from Firebase (파이어베이스에서 트윗 문서 및 이미지 삭제)
  const deleteTweet = async () => {
    try {
      await firestore().collection('tweets').doc(id).delete(); // Remove Firestore doc (파이어스토어 문서 삭제)
      if (photo) {
        const storageRef = storage().refFromURL(photo); // Reference to stored image (스토리지 이미지 참조)
        await storageRef.delete(); // Delete image file (이미지 파일 삭제)
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  // Update tweet content and upload new photo if selected (트윗 내용 업데이트 및 새 사진 업로드)
  const editTweet = async () => {
    try {
      let updatedPhoto = newPhoto;
      if (imageUri) {
        const reference = storage().ref(`/tweets/${currentUser.uid}/${id}`);
        await reference.putFile(imageUri); // Upload image file (이미지 파일 업로드)
        updatedPhoto = await reference.getDownloadURL(); // Get downloadable URL (다운로드 가능한 URL 획득)
      }

      await firestore().collection('tweets').doc(id).update({
        tweet: newTweet,
        photo: updatedPhoto,
        modifiedAt: firestore.FieldValue.serverTimestamp(),
      });
      setEditModalVisible(false);
      setModalVisible(false);
      if (onEdit) {
        onEdit(id, newTweet, updatedPhoto);
      }
    } catch (error) {
      console.error('Error updating tweet:', error);
    }
  };

  // Present options to capture or select image (이미지 촬영 또는 선택 옵션 표시)
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

  // Handle result from image picker and update URI state (이미지 선택 결과 처리 및 URI 상태 업데이트)
  const handleImageResult = result => {
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // Set selected image URI (선택된 이미지 URI 설정)
    }
  };

  // Reset editing state and close edit modal (편집 상태 초기화 및 편집 모달 닫기)
  const closeModal = () => {
    setNewTweet(tweet); // Revert tweet text (트윗 텍스트 복원)
    setImageUri(photo); // Reset image URI to original photo (이미지 URI 초기화)
    setNewPhoto(null); // Clear new photo state (새 사진 상태 초기화)
    setEditModalVisible(false);
  };

  return (
    <TouchableOpacity
      onPress={() => setModalVisible(true)} // Open tweet detail modal on press (트윗 클릭 시 상세 모달 오픈)
      style={styles.wrapper}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={50} />
        <Text style={styles.username}>{username}</Text>
      </View>
      <Text style={styles.payload}>{tweet}</Text>
      {photo && <Image style={styles.photo} source={{uri: photo}} />}
      <View style={{height: 0.3, backgroundColor: 'rgba(176, 176, 176, 1)'}} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <MaterialCommunityIcons name="account-circle" size={50} />
                  <Text style={styles.username}>{username}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.iconCloseButton}>
                    <MaterialCommunityIcons
                      name="close"
                      size={25}
                      color="rgba(89, 89, 89, 1)"
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  <Text style={styles.payload}>{tweet}</Text>
                  {photo && (
                    <Image style={styles.modalPhoto} source={{uri: photo}} />
                  )}
                  {/* Conditional rendering for owner/admin controls (작성자/관리자만 편집/삭제 가능) */}
                  {currentUser &&
                    (currentUser.uid === userId ||
                      currentUser.email === ADMIN_EMAIL) && (
                      <>
                        <TouchableOpacity
                          onPress={() => setEditModalVisible(true)} // Open edit modal (편집 모달 오픈)
                          style={styles.editButton}>
                          <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setDeleteConfirmVisible(true)} // Open delete confirm modal (삭제 확인 모달 오픈)
                          style={styles.deleteButton}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </>
                    )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Edit Tweet Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.editModalContent}>
                <ScrollView>
                  <View style={styles.header}>
                    <Text style={styles.username}>Edit tweet</Text>
                    <TouchableOpacity
                      onPress={closeModal}
                      style={styles.iconCloseButton}>
                      <MaterialCommunityIcons
                        name="close"
                        size={25}
                        color="rgba(89, 89, 89, 1)"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={setNewTweet}
                      value={newTweet}
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={500}
                      multiline
                    />
                    {(imageUri || newPhoto) && (
                      <>
                        <Image
                          style={styles.modalPhoto}
                          source={{uri: imageUri || newPhoto}}
                        />
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => {
                            setImageUri(null); // Remove image (이미지 제거)
                            setNewPhoto(null);
                          }}>
                          <Text style={styles.editText}>Remove image</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={onFileChange}>
                      <Text style={styles.editText}>Add image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={editTweet}>
                      <Text style={styles.updateText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setDeleteConfirmVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.deleteModalContent}>
                <Text style={styles.username}>Delete tweet</Text>
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to delete this tweet?
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await deleteTweet(); // Execute tweet deletion (트윗 삭제 실행)
                    if (onDelete) onDelete(id);
                    setDeleteConfirmVisible(false);
                    setModalVisible(false);
                  }}
                  style={styles.updateButton}>
                  <Text style={styles.updateText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeleteConfirmVisible(false)}
                  style={styles.editButton}>
                  <Text style={styles.editText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  username: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 5,
  },
  payload: {
    marginVertical: 5,
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(52, 52, 52, 1)',
  },
  photo: {
    width: 310,
    height: 200,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  modalPhoto: {
    width: 280,
    height: 150,
    marginTop: 10,
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: 'rgba(242, 242, 242, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  editText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  updateText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(240, 68, 82, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteConfirmText: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    marginVertical: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 320,
    height: 520,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  editModalContent: {
    width: 320,
    height: 600,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  deleteModalContent: {
    width: 320,
    height: 320,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  iconCloseButton: {
    position: 'absolute',
    top: 5,
    right: 1,
  },
  inputContainer: {
    marginVertical: 10,
  },
  textInput: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 16,
    height: 150,
    borderColor: 'rgba(89, 89, 89, 1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  },
  imageButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  saveText: {
    color: 'white',
    fontSize: 14,
  },
});
