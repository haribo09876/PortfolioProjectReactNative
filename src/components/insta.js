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
  Dimensions,
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

const windowWidth = Dimensions.get('window').width;

export default function Insta({
  username,
  avatar,
  insta,
  photo,
  id,
  userId,
  onEdit,
  onDelete,
}) {
  const currentUser = auth().currentUser;
  const [newInsta, setNewInsta] = useState(insta);
  const [newPhoto, setNewPhoto] = useState(photo);
  const [imageUri, setImageUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Delete post from Firestore and associated image from Storage (Firestore 문서 및 이미지 삭제)
  const deleteInsta = async () => {
    try {
      await firestore().collection('instas').doc(id).delete();
      if (photo) {
        const storageRef = storage().refFromURL(photo);
        await storageRef.delete(); // Delete associated image file (이미지 파일 삭제)
      }
    } catch (error) {
      console.error('Error deleting insta:', error);
    }
  };

  // Update post text and image in Firestore (본문 및 이미지 업데이트)
  const editInsta = async () => {
    try {
      let updatedPhoto = newPhoto;

      // If a new image is selected, upload and get URL (새 이미지 선택 시 업로드 및 URL 획득)
      if (imageUri) {
        const reference = storage().ref(`/instas/${currentUser.uid}/${id}`);
        await reference.putFile(imageUri); // Upload local file (로컬 파일 업로드)
        updatedPhoto = await reference.getDownloadURL(); // Get public URL (공개 URL 획득)
      }

      await firestore().collection('instas').doc(id).update({
        insta: newInsta,
        photo: updatedPhoto,
        modifiedAt: firestore.FieldValue.serverTimestamp(),
      });
      setEditModalVisible(false);
      setModalVisible(false);
      if (onEdit) {
        onEdit(id, newInsta, updatedPhoto);
      }
    } catch (error) {
      console.error('Error updating insta:', error);
    }
  };

  // Trigger image picker dialog (이미지 선택 다이얼로그 표시)
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

  // Handle selected image result from picker (이미지 선택 결과 처리)
  const handleImageResult = result => {
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Reset state and close edit modal (수정 모달 초기화 및 종료)
  const closeModal = () => {
    setNewInsta(insta);
    setImageUri(photo);
    setNewPhoto(null);
    setEditModalVisible(false);
  };

  return (
    <TouchableOpacity
      onPress={() => setModalVisible(true)}
      style={styles.wrapper}>
      <View style={styles.content}>
        {photo && <Image style={styles.instaPhoto} source={{uri: photo}} />}
      </View>
      {/* Main Detail Modal (메인 상세 모달) */}
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
                  {photo && (
                    <Image style={styles.modalPhoto} source={{uri: photo}} />
                  )}
                  <Text style={styles.payload}>{insta}</Text>
                  {/* Conditional admin/owner controls (관리자 또는 작성자 전용 제어) */}
                  {currentUser &&
                    (currentUser.uid === userId ||
                      currentUser.email === ADMIN_EMAIL) && (
                      <>
                        <TouchableOpacity
                          onPress={() => setEditModalVisible(true)}
                          style={styles.editButton}>
                          <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setDeleteConfirmVisible(true)}
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
      {/* Edit Modal (수정 모달) */}
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
                    <Text style={styles.username}>Edit insta</Text>
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
                    {(imageUri || newPhoto) && (
                      <Image
                        style={styles.modalPhoto}
                        source={{uri: imageUri || newPhoto}}
                      />
                    )}
                    <TextInput
                      style={styles.textInput}
                      onChangeText={setNewInsta}
                      value={newInsta}
                      paddingVertical={20}
                      textAlignVertical="top"
                      maxLength={500}
                      multiline
                    />
                    {(imageUri || newPhoto) && (
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setImageUri(null);
                          setNewPhoto(null);
                        }}>
                        <Text style={styles.editText}>Remove image</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={onFileChange}>
                      <Text style={styles.editText}>Add image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={editInsta}>
                      <Text style={styles.updateText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Delete Confirmation Modal (삭제 확인 모달) */}
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
                <Text style={styles.username}>Delete insta</Text>
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to delete this insta?
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await deleteInsta();
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
    width: 120,
    height: 120,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
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
    width: 330,
    height: 200,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 50,
  },
  instaPhoto: {
    width: '100%',
    height: '100%',
  },
  modalPhoto: {
    width: 280,
    height: 280,
    marginTop: 10,
    marginBottom: 10,
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
    height: 100,
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
