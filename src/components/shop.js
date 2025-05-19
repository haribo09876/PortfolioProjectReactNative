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
        {photo && <Image style={styles.photo} source={{uri: photo}} />}
        <Text style={styles.itemTitle}>{itemTitle}</Text>
        <Text style={styles.itemPrice}>
          {Number(itemPrice).toLocaleString()}원
        </Text>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <View style={styles.header}>
                    <Text style={styles.itemTitle}>{itemTitle}</Text>
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
                  {photo && (
                    <Image style={styles.shopPhoto} source={{uri: photo}} />
                  )}
                  <Text style={styles.itemPrice}>
                    {Number(itemPrice).toLocaleString()}원
                  </Text>
                  <Text style={styles.itemDetail}>{itemDetail}</Text>
                  <TouchableOpacity
                    onPress={purchase}
                    style={styles.purchaseButton}>
                    <Text style={styles.purchaseText}>Purchase</Text>
                  </TouchableOpacity>
                  {currentUser &&
                    (currentUser.uid === id ||
                      currentUser.email === 'admin@gmail.com') && (
                      <>
                        <TouchableOpacity
                          onPress={() => setEditModalVisible(true)}
                          style={styles.editButton}>
                          <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={deleteShop}
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
    padding: 10,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  content: {
    flex: 1,
    marginBottom: 10,
  },
  username: {
    fontWeight: 'semibold',
    fontSize: 20,
    color: '#333333',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(52, 52, 52, 1)',
    padding: 10,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(52, 52, 52, 1)',
    marginTop: 10,
    marginRight: 10,
    textAlign: 'right',
  },
  itemDetail: {
    marginVertical: 5,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(52, 52, 52, 1)',
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  shopPhoto: {
    width: 280,
    height: 400,
    borderRadius: 10,
    marginTop: 10,
  },
  purchaseButton: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 280,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
  },
  purchaseText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
  iconCloseButton: {
    position: 'absolute',
    top: 12,
    right: 10,
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
