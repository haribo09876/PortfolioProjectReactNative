import React, {useState, useEffect, useRef} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [newPassword, setNewPassword] = useState(user.password);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (!user) {
      return;
    }

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

    return () => moneyData();
  }, [user]);

  const closeModal = () => {
    // setNewItemTitle(itemTitle);
    // setNewItemPrice(itemPrice);
    // setNewItemDetail(itemDetail);
    // setImageUri(photo);
    // setNewPhoto(null);
    setNewUserName(user.displayName);
    setNewPassword('');
    setEditModalVisible(false);
  };

  const onAvatarChange = async () => {
    if (!user) {
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageResponse = await fetch(asset.uri);
        const blob = await imageResponse.blob();
        const storageRef = storage().ref().child(`avatars/${user?.uid}`);

        try {
          const uploadTask = storageRef.put(blob);
          uploadTask.on(
            'state_changed',
            null,
            error => {
              console.error('Error uploading image: ', error);
            },
            async () => {
              try {
                const downloadURL = await storageRef.getDownloadURL();
                setAvatar(downloadURL);
                await auth().currentUser.updateProfile({photoURL: downloadURL});
              } catch (error) {
                console.error('Error getting download URL: ', error);
              }
            },
          );
        } catch (error) {
          console.error('Error uploading image: ', error);
        }
      }
    });
  };

  const handleAccountDelete = async () => {
    try {
      await user.delete();
      // auth.signOut();
      setDeleteConfirmVisible(false);
      navRef.current?.replace('LoginPage');
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
          <Text style={styles.money}>
            {moneys.length > 0
              ? (moneys[0].money - moneys[0].spend).toLocaleString()
              : 'No data'}
            원
          </Text>
          {user?.uid === 'PdWutJuG1yPegHocDTMJVLPu1jr2' && (
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
                {/* {(imageUri || newPhoto) && (
                  <>
                    <Image
                      style={styles.shopPhoto}
                      source={{uri: imageUri || newPhoto}}
                    />
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setImageUri(null);
                        setNewPhoto(null);
                      }}>
                      <Text style={styles.editText}>Remove image</Text>
                    </TouchableOpacity>
                  </>
                )} */}
                {/* <TouchableOpacity
                  style={styles.avatarUpload}
                  onPress={onAvatarChange}>
                  {avatar ? (
                    <Image source={{uri: avatar}} style={styles.avatarImg} />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      style={styles.avatarIcon}
                    />
                  )}
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.avatarUpload}
                  onPress={onAvatarChange}>
                  {avatar ? (
                    <Image source={{uri: avatar}} style={styles.avatarImg} />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      style={styles.avatarIcon}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.userEmailText}>{user?.email ?? ' '}</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholder="New username"
                  placeholderTextColor="rgba(89, 89, 89, 1)"
                />
                <TextInput
                  style={styles.inputBox}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  placeholderTextColor="rgba(89, 89, 89, 1)"
                  secureTextEntry={true}
                />
                <TouchableOpacity
                  // onPress={closeModal}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Remove image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  // onPress={closeModal}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Add image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await // editAccount();
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
    marginBottom: 10,
  },
  dashboardButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 360,
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
    width: 360,
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
    width: 360,
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
  userEmailText: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
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
