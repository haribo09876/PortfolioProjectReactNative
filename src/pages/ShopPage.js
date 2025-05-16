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
  Text,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ShopTimeline from '../components/shopTimeline';

const ShopPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDetail, setItemDetail] = useState('');
  const [file, setFile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const onChangeItemTitle = text => {
    setItemTitle(text);
  };

  const onChangeItemPrice = text => {
    setItemPrice(Number(text));
  };

  const onChangeItemDetail = text => {
    setItemDetail(text);
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
    if (!user || isLoading || itemTitle === '' || itemTitle.length > 180) {
      return;
    }
    try {
      setLoading(true);
      const shopRef = firestore().collection('shops').doc();
      const shopData = {
        itemTitle,
        itemPrice,
        itemDetail,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: user.displayName || 'Anonymous',
        userId: user.uid,
      };
      await shopRef.set(shopData);

      if (file) {
        const storageRef = storage().ref(`shops/${user.uid}/${shopRef.id}`);
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
            await shopRef.update({photo: url});
            setFile(null);
          },
        );
      }
      setItemTitle('');
      setItemPrice('');
      setItemDetail('');
      setModalVisible(false);
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

  const openModal = () => {
    setModalVisible(true);
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
                  style={styles.itemInput}
                  onChangeText={onChangeItemTitle}
                  value={itemTitle}
                  placeholder="itemTitle"
                  maxLength={50}
                  multiline
                />
                <TextInput
                  style={styles.itemInput}
                  onChangeText={onChangeItemPrice}
                  value={itemPrice}
                  placeholder="itemPrice"
                  maxLength={9}
                  keyboardType="numeric"
                  multiline
                />
                <TextInput
                  style={styles.textInput}
                  onChangeText={onChangeItemDetail}
                  value={itemDetail}
                  placeholder="itemDetail"
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
                    title={isLoading ? 'Posting...' : 'Post Shop'}
                    onPress={onSubmit}
                    disabled={!itemTitle || isLoading}
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
      <ShopTimeline />
      {userEmail === 'admin@gmail.com' && (
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
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(75, 127, 247, 1)',
    width: 360,
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
    fontWeight: '600',
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
  itemInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 30,
    fontSize: 16,
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

export default ShopPage;
