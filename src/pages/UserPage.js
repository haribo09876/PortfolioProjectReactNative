import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import UserTweet from '../components/userTweet';
import UserInsta from '../components/userInsta';

function UserPage() {
  const user = auth().currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);

  const onAvatarChange = async () => {
    if (!user) return;

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
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const storageRef = storage().ref(`avatars/${user.uid}`);

        try {
          const uploadSnapshot = await uploadBytes(storageRef, blob);
          const avatarUrl = await getDownloadURL(uploadSnapshot.ref);
          setAvatar(avatarUrl);
          await auth.currentUser.updateProfile({photoURL: avatarUrl});
        } catch (error) {
          console.error('Error uploading image: ', error);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Info</Text>
      <TouchableOpacity style={styles.avatarUpload} onPress={onAvatarChange}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.avatarImg} />
        ) : (
          <MaterialCommunityIcons name="face-man" style={styles.avatarIcon} />
        )}
      </TouchableOpacity>
      <Text style={styles.name}>{user?.displayName ?? 'Anonymous'}</Text>
      <Text style={styles.sectionTitle}>My Tweets</Text>
      <UserTweet />
      <Text style={styles.sectionTitle}>My Instas</Text>
      <UserInsta />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    padding: 20,
  },
  avatarUpload: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#1d9bf0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarIcon: {
    fontSize: 40,
    color: 'white',
  },
  name: {
    fontSize: 22,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default UserPage;
