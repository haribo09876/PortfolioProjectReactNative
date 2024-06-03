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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default function Insta({username, avatar, insta, photo, id, userId}) {
  const currentUser = auth().currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newInsta, setNewInsta] = useState(insta);
  const [newPhoto, setNewPhoto] = useState(photo);
  const [imageUri, setImageUri] = useState(null);

  const deleteInsta = async () => {
    try {
      await firestore().collection('instas').doc(id).delete();
      if (photo) {
        const storageRef = storage().refFromURL(photo);
        await storageRef.delete();
      }
    } catch (error) {
      console.error('Error deleting insta:', error);
    }
  };

  const editInsta = async () => {
    try {
      let updatedPhoto = newPhoto;
      if (imageUri) {
        const reference = storage().ref(`/instas/${id}`);
        await reference.putFile(imageUri);
        updatedPhoto = await reference.getDownloadURL();
      }

      await firestore().collection('instas').doc(id).update({
        insta: newInsta,
        photo: updatedPhoto,
      });
      setEditModalVisible(false);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating insta:', error);
    }
  };

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

  const handleImageResult = result => {
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => setModalVisible(true)}
      style={styles.wrapper}>
      <View style={styles.content}>
        {photo && <Image style={styles.photo} source={{uri: photo}} />}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
              style={styles.iconCloseButton}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={32}
                color="#3A3A3A"
              />
            </TouchableOpacity>
            <ScrollView>
              <MaterialCommunityIcons name="account-circle" size={50} />
              <Text style={styles.username}>{username}</Text>
              {photo && <Image style={styles.photo} source={{uri: photo}} />}
              <Text style={styles.payload}>{insta}</Text>
              {currentUser && currentUser.uid === userId && (
                <View>
                  <TouchableOpacity
                    onPress={deleteInsta}
                    style={styles.deleteButton}>
                    <MaterialCommunityIcons name="delete-outline" size={25} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(true)}
                    style={styles.editButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={25} />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setEditModalVisible(!editModalVisible)}
              style={styles.iconCloseButton}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={32}
                color="#3A3A3A"
              />
            </TouchableOpacity>
            <ScrollView>
              <Text style={styles.username}>{username}</Text>
              <TextInput
                style={styles.textInput}
                value={newInsta}
                onChangeText={setNewInsta}
                multiline
              />
              {imageUri ? (
                <Image style={styles.photo} source={{uri: imageUri}} />
              ) : (
                newPhoto && (
                  <Image style={styles.photo} source={{uri: newPhoto}} />
                )
              )}
              <TouchableOpacity
                onPress={onFileChange}
                style={styles.imageButton}>
                <Text style={styles.imageButtonText}>Change Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={editInsta} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
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
    fontWeight: 'semibold',
    fontSize: 20,
    color: '#333333',
  },
  payload: {
    marginVertical: 5,
    fontSize: 16,
    color: '#666666',
  },
  photo: {
    width: '100%',
    height: 200,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  deleteText: {
    color: 'white',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  editText: {
    color: 'white',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
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
    top: 15,
    right: 15,
  },
  textInput: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginVertical: 10,
    height: 100,
    textAlignVertical: 'top',
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
