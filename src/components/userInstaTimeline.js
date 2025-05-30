import React, {useEffect, useState} from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Insta from './insta';
import auth from '@react-native-firebase/auth';

export default function UserInstaTimeline() {
  const [instas, setInstas] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    const unsubscribe = firestore()
      .collection('instas')
      .where('userId', '==', user?.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const updatedInstas = querySnapshot.docs.map(doc => {
            const {insta, createdAt, userId, username, photo} = doc.data();
            return {
              insta,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id,
            };
          });
          setInstas(updatedInstas);
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {instas.map(insta => (
        <View key={insta.id} style={styles.instaWrapper}>
          <Insta {...insta} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  instaWrapper: {
    transform: [{scale: 0.9}],
    margin: -5,
  },
});
