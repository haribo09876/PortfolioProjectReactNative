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
  const [newItemTitle, setNewItemTitle] = useState(itemTitle);
  const [newItemPrice, setNewItemPrice] = useState(itemPrice);
  const [newItemDetail, setNewItemDetail] = useState(itemDetail);
  const [newPhoto, setNewPhoto] = useState(photo);
  const [imageUri, setImageUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

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

  const closeModal = () => {
    setNewItemTitle(itemTitle);
    setNewItemPrice(itemPrice);
    setNewItemDetail(itemDetail);
    setImageUri(photo);
    setNewPhoto(null);
    setEditModalVisible(false);
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
                <ScrollView>
                  {photo && (
                    <Image style={styles.shopPhoto} source={{uri: photo}} />
                  )}
                  <Text style={styles.itemPrice}>
                    {Number(itemPrice).toLocaleString()}원
                  </Text>
                  <Text style={styles.itemDetail}>{itemDetail}</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await purchase();
                      setPurchaseModalVisible(true);
                    }}
                    style={styles.purchaseButton}>
                    <Text style={styles.purchaseText}>Purchase</Text>
                  </TouchableOpacity>
                  {currentUser &&
                    (currentUser.uid === id ||
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={purchaseModalVisible}
        onRequestClose={async () => {
          setPurchaseModalVisible(false);
          setModalVisible(false);
        }}>
        <TouchableWithoutFeedback
          onPress={async () => {
            setPurchaseModalVisible(false);
            setModalVisible(false);
          }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.deleteModalContent}>
                <Text style={styles.itemTitle}>Purchase item</Text>
                <Text style={styles.deleteConfirmText}>
                  Thank you for your purchase!
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    setPurchaseModalVisible(false);
                    setModalVisible(false);
                  }}
                  style={styles.editButton}>
                  <Text style={styles.editText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
                    <Text style={styles.itemTitle}>Edit item</Text>
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
                      style={styles.textItemTitleInput}
                      value={newItemTitle}
                      onChangeText={setNewItemTitle}
                      textAlignVertical="top"
                      maxLength={50}
                      multiline
                    />
                    <TextInput
                      style={styles.textItemPriceInput}
                      value={newItemPrice.toString()}
                      onChangeText={text => setNewItemPrice(Number(text))}
                      keyboardType="numeric"
                      maxLength={9}
                      multiline
                    />
                    <TextInput
                      style={styles.textItemDetailInput}
                      value={newItemDetail}
                      onChangeText={setNewItemDetail}
                      textAlignVertical="top"
                      maxLength={500}
                      multiline
                    />
                    {(imageUri || newPhoto) && (
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
                    )}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={onFileChange}>
                      <Text style={styles.editText}>Add image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={editShop}>
                      <Text style={styles.updateText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
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
                <Text style={styles.itemTitle}>Delete item</Text>
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to delete this item?
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await deleteShop();
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
    width: windowWidth / 2,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
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
  itemTitle: {
    color: 'rgba(52, 52, 52, 1)',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 10,
    marginLeft: 5,
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
    fontWeight: '500',
    color: 'rgba(52, 52, 52, 1)',
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  shopPhoto: {
    width: 280,
    height: 350,
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
    fontWeight: '500',
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
    marginBottom: 10,
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
