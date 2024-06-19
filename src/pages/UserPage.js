import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import UserTweet from '../components/userTweet';
import UserInsta from '../components/userInsta';

function UserPage() {
  const user = auth().currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);

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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Info</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity style={styles.avatarUpload} onPress={onAvatarChange}>
          {avatar ? (
            <Image source={{uri: avatar}} style={styles.avatarImg} />
          ) : (
            <MaterialCommunityIcons name="face-man" style={styles.avatarIcon} />
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user?.displayName ?? 'Anonymous'}</Text>
        <MaterialCommunityIcons
          name="pencil-outline"
          size={25}
          style={{marginLeft: 10}}
        />
      </View>
      <Text style={styles.sectionTitle}>My Instas</Text>
      <UserInsta />
      <Text style={styles.sectionTitle}>My Tweets</Text>
      <UserTweet />
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
    width: 70,
    height: 70,
    borderRadius: 50,
    margin: 10,
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
    fontSize: 25,
    fontWeight: '500',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '400',
    marginTop: 20,
    marginBottom: 5,
  },
});

export default UserPage;
