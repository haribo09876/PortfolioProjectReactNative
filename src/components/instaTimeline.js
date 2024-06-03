import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Insta from './insta';

export default function InstaTimeline() {
  const [instas, setInstas] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('instas')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
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
      });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      {instas.map(insta => (
        <Insta key={insta.id} {...insta} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
});
