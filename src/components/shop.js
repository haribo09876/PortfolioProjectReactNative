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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const windowWidth = Dimensions.get('window').width;

export default function Shop({
  username,
  avatar,
  itemTitle,
  itemPrice,
  itemDetail,
  photo,
  id,
}) {
  const currentUser = auth().currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState(itemTitle);
  const [newItemPrice, setNewItemPrice] = useState(itemPrice);
  const [newItemDetail, setNewItemDetail] = useState(itemDetail);
  const [newPhoto, setNewPhoto] = useState(photo);
  const [imageUri, setImageUri] = useState(null);

  const navigation = useNavigation();

  const deleteShop = async () => {
    try {
      await firestore().collection('shops').doc(id).delete();
      if (photo) {
        const storageRef = storage().refFromURL(photo);
        await storageRef.delete();
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
    }
  };

  const editShop = async () => {
    try {
      let updatedPhoto = newPhoto;
      if (imageUri) {
        const reference = storage().ref(`/shops/${currentUser.uid}/${id}`);
        await reference.putFile(imageUri);
        updatedPhoto = await reference.getDownloadURL();
      }
      await firestore()
        .collection('shops')
        .doc(id)
        .update({
          itemTitle: newItemTitle,
          itemPrice: Number(newItemPrice),
          itemDetail: newItemDetail,
          photo: updatedPhoto,
          modifiedAt: firestore.FieldValue.serverTimestamp(),
        });
      setEditModalVisible(false);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating shop:', error);
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

  const purchase = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('moneys')
        .where('userEmail', '==', currentUser.email)
        .get();

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async documentSnapshot => {
          const currentSpend = documentSnapshot.data().spend;
          const updatedSpend = currentSpend + Number(itemPrice);
          await documentSnapshot.ref.update({
            spend: updatedSpend,
            modifiedAt: firestore.FieldValue.serverTimestamp(),
          });
        });
      } else {
        console.error('No documents found with the given userEmail.');
      }

      const moneyRef = firestore().collection('sales').doc();
      const moneyData = {
        createdAt: firestore.FieldValue.serverTimestamp(),
        itemId: id,
        itemTitle: itemTitle,
        itemPrice: Number(itemPrice),
        userId: currentUser.uid,
      };
      await moneyRef.set(moneyData);
      navigation.navigate('CompletionPage');
    } catch (error) {
      console.error('Error purchase:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => setModalVisible(true)}
      style={styles.wrapper}>
      <View style={styles.content}>
        <Text style={styles.payload}>{itemTitle}</Text>
        {photo && <Image style={styles.photo} source={{uri: photo}} />}
        <Text style={styles.payload}>{itemPrice} 원</Text>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
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
                <Text style={styles.payload}>{itemTitle}</Text>
                {photo && (
                  <Image style={styles.shopPhoto} source={{uri: photo}} />
                )}
                <Text style={styles.payload}>{itemPrice} 원</Text>
                <Text style={styles.payload}>{itemDetail}</Text>
                <TouchableOpacity
                  style={styles.purchaseButton}
                  onPress={purchase}>
                  <Text style={styles.purchaseText}>구 매</Text>
                </TouchableOpacity>
                {currentUser && (
                  <View>
                    {currentUser.email === 'admin@gmail.com' && (
                      <View>
                        <TouchableOpacity
                          onPress={deleteShop}
                          style={styles.deleteButton}>
                          <MaterialCommunityIcons
                            name="delete-outline"
                            size={25}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setEditModalVisible(true)}
                          style={styles.editButton}>
                          <MaterialCommunityIcons
                            name="pencil-outline"
                            size={25}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}>
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
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
                <TextInput
                  style={styles.itemInput}
                  value={newItemTitle}
                  onChangeText={setNewItemTitle}
                  maxLength={50}
                  multiline
                />
                <TextInput
                  style={styles.itemInput}
                  value={newItemPrice.toString()}
                  onChangeText={text => setNewItemPrice(Number(text))}
                  maxLength={9}
                  keyboardType="numeric"
                  multiline
                />
                <TextInput
                  style={styles.textInput}
                  value={newItemDetail}
                  onChangeText={setNewItemDetail}
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
                <TouchableOpacity onPress={editShop} style={styles.saveButton}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: windowWidth / 2,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    marginVertical: 5,
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
    borderRadius: 5,
    marginTop: 10,
  },
  shopPhoto: {
    width: auth,
    height: 400,
    borderRadius: 10,
    marginTop: 10,
  },
  purchaseButton: {
    width: '100%',
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  purchaseText: {
    color: 'white',
    fontSize: 20,
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
