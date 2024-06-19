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

  const onChange = text => {
    setInsta(text);
  };

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

  const clearFile = () => {
    setFile(null);
  };

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
      };
      await instaRef.set(instaData);

      if (file) {
        const storageRef = storage().ref(`instas/${user.uid}/${instaRef.id}`);
        const uploadTask = storageRef.putFile(file.uri);
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
            const url = await storageRef.getDownloadURL();
            await instaRef.update({photo: url});
            setFile(null);
          },
        );
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

  // const openModal = () => {
  //   setModalVisible(true);
  // };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add Insta</Text>
      </TouchableOpacity> */}
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
