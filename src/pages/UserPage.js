import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import UserTweet from '../components/userTweet';
import UserInsta from '../components/userInsta';

function UserPage() {
  const user = auth().currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [moneys, setMoneys] = useState([]);

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>My Info</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
          <Text style={styles.name}>{user?.displayName ?? 'Anonymous'}</Text>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={25}
            style={styles.edit}
          />
          <Text style={styles.money}>
            {moneys.length > 0 ? moneys[0].money - moneys[0].spend : 'No data'}{' '}
            원
          </Text>
        </View>
        <Text style={styles.sectionTitle}>My Instas</Text>
        <UserInsta />
        <Text style={styles.sectionTitle}>My Tweets</Text>
        <UserTweet />
        <Text style={styles.sectionTitle}>My Purchases</Text>
        {/* <UserPurchase /> */}
      </ScrollView>
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
    width: 65,
    height: 65,
    borderRadius: 50,
    margin: 10,
    backgroundColor: 'gray',
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
  edit: {
    fontSize: 22,
    marginLeft: 10,
  },
  money: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 50,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '400',
    marginTop: 20,
    marginBottom: 5,
  },
});

export default UserPage;
