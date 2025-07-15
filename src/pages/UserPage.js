import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {ADMIN_UID} from '@env';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import UserTweet from '../components/userTweet';
import UserInsta from '../components/userInsta';
import Sales from '../components/sales';

function UserPage() {
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [moneys, setMoneys] = useState([]);
  const [newUserName, setNewUserName] = useState(user.displayName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Subscribe to Firestore changes for user's money records (파이어스토어 사용자 재무 데이터 구독)
    const moneyData = firestore()
      .collection('moneys')
      .where('userEmail', '==', user.email)
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const updatedMoneys = querySnapshot.docs.map(doc => {
            const {money, createdAt, spend, userEmail, username} = doc.data();
            return {
              money,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              spend,
              userEmail,
              username,
            };
          });
          setMoneys(updatedMoneys);
        } else {
          console.log('No data found');
        }
      });

    return () => moneyData(); // Cleanup listener (리스너 정리)
  }, [user]);

  const closeModal = () => {
    // Reset modal state to default values (모달 상태 초기화)
    setNewUserName(user.displayName);
    setAvatar(user.photoURL);
    setNewPassword('');
    setCurrentPassword('');
    setEditModalVisible(false);
  };

  const onFileChange = async () => {
    // Open image picker and set selected image as avatar (이미지 선택 후 아바타 설정)
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
    // Remove avatar image from state (프로필 이미지 제거)
    setAvatar(null);
  };

  const editAccount = async () => {
    // Prevent update if no changes detected (변경 사항 없으면 업데이트 중단)
    if (
      newUserName === user.displayName &&
      newPassword === '' &&
      avatar === user.photoURL
    ) {
      Alert.alert('No changes', 'There are no changes to update.');
      return;
    }

    try {
      let uploadedAvatarURL = null;

      // Upload new avatar to Firebase Storage (새 프로필 이미지 스토리지 업로드)
      if (avatar && avatar !== user.photoURL) {
        const storageRef = storage().ref(`avatars/${user.uid}`);
        await storageRef.putFile(avatar);
        uploadedAvatarURL = await storageRef.getDownloadURL();
      } else if (!avatar) {
        uploadedAvatarURL = null;
      }

      // Prepare profile update object (프로필 업데이트 객체 준비)
      const profileUpdates = {};
      if (newUserName !== user.displayName) {
        profileUpdates.displayName = newUserName;
      }
      if (avatar !== user.photoURL) {
        profileUpdates.photoURL = uploadedAvatarURL;
      }

      // Update Firebase Authentication profile (Firebase 인증 프로필 업데이트)
      if (Object.keys(profileUpdates).length > 0) {
        await user.updateProfile(profileUpdates);
      }

      // Update password with re-authentication (재인증 후 비밀번호 변경)
      if (newPassword !== '') {
        if (currentPassword === '') {
          Alert.alert(
            'Current password required',
            'Please enter your current password to change your password.',
          );
          return;
        }

        const credential = auth.EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );

        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
      }

      // Sync user profile with Firestore (Firestore 사용자 정보 동기화)
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(
          {
            username: newUserName,
            photoURL: uploadedAvatarURL !== null ? uploadedAvatarURL : null,
          },
          {merge: true},
        );

      // Reset modal state after successful update (성공 시 상태 초기화)
      setNewUserName(user.displayName);
      setNewPassword('');
      setCurrentPassword('');
      setEditModalVisible(false);
      Alert.alert('Success', 'Account updated successfully.');
    } catch (error) {
      console.error('Edit account error:', error);
      Alert.alert('Error', error.message || 'Failed to update account.');
    }
  };

  const handleAccountDelete = async () => {
    // Delete user account from Firebase (Firebase 사용자 계정 삭제)
    try {
      await setDeleteConfirmVisible(false);
      user.delete();
      navigation.navigate('LoginPage');
    } catch (error) {
      Alert.alert('Logout error', 'Problem while logout');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarUpload}>
            {avatar ? (
              <Image source={{uri: avatar}} style={styles.avatarImg} />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                style={styles.avatarIcon}
                size={100}
              />
            )}
          </View>
          <Text style={styles.name}>{user?.displayName ?? 'Anonymous'}</Text>
          <Text style={styles.email}>{user?.email ?? ' '}</Text>
          <View>
            <Text>
              {moneys.length > 0
                ? `${(moneys[0].money - moneys[0].spend).toLocaleString()}원`
                : 'No data'}
            </Text>
          </View>
          {user?.uid === ADMIN_UID && (
            <TouchableOpacity
              onPress={() => navigation.navigate('DashboardPage')}
              style={styles.dashboardButton}>
              <Text style={styles.dashboardText}>To dashboard</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>My Tweet</Text>
          <UserTweet />
          <Text style={styles.sectionTitle}>My Insta</Text>
          <UserInsta />
          <Text style={styles.sectionTitle}>My Purchase</Text>
          <Sales />
        </View>
        <TouchableOpacity
          onPress={() => setEditModalVisible(true)}
          style={styles.editButton}>
          <Text style={styles.editText}>Edit account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDeleteConfirmVisible(true)}
          style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Edit Modal (프로필 수정 모달) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.editModalContent}>
                <Text style={styles.username}>Edit account</Text>
                <View style={styles.avatarUpload}>
                  {avatar ? (
                    <Image source={{uri: avatar}} style={styles.avatarImg} />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      style={styles.avatarIcon}
                      size={100}
                    />
                  )}
                </View>
                <TextInput
                  style={styles.inputBox}
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholder="New username"
                  placeholderTextColor="rgba(89, 89, 89, 1)"
                />
                <TextInput
                  style={styles.inputBox}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  placeholderTextColor="rgba(89, 89, 89, 1)"
                  secureTextEntry={true}
                />
                <TextInput
                  style={styles.inputBox}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  placeholderTextColor="rgba(89, 89, 89, 1)"
                  secureTextEntry={true}
                />
                {avatar && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={removeImage}>
                    <Text style={styles.cancelText}>Remove image</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onFileChange}>
                  <Text style={styles.cancelText}>Add image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await editAccount();
                    setEditModalVisible(false);
                  }}
                  style={styles.updateButton}>
                  <Text style={styles.confirmText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Delete Confirmation Modal (계정 삭제 확인 모달) */}
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
                <Text style={styles.username}>Delete account</Text>
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to delete this account?
                </Text>
                <TouchableOpacity
                  onPress={handleAccountDelete}
                  style={styles.confirmButton}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeleteConfirmVisible(false)}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 5,
  },
  content: {
    margin: 20,
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
  name: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 25,
    fontWeight: '500',
  },
  email: {
    color: 'rgba(176, 176, 176, 1)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 5,
  },
  money: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'right',
    width: 320,
  },
  sectionTitle: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 30,
    marginBottom: 10,
  },
  dashboardButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 340,
    height: 45,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  dashboardText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  editButton: {
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
  editText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(240, 68, 82, 1)',
    width: 340,
    height: 45,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  deleteText: {
    color: 'white',
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
  confirmButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'rgba(242, 242, 242, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  username: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 5,
  },
  inputBox: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 15,
    height: 50,
    borderColor: 'rgba(89, 89, 89, 1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  deleteConfirmText: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    marginVertical: 50,
  },
});

export default UserPage;
