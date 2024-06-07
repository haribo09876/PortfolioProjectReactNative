import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View, Dimensions} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Insta from './insta';

const windowWidth = Dimensions.get('window').width;

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

  const renderItem = ({item}) => <Insta key={item.id} {...item} />;

  return (
    <FlatList
      data={instas}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={3}
      contentContainerStyle={styles.wrapper}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
});
