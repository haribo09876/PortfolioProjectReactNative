import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Insta from './insta';

export default function InstaTimeline() {
  const [instas, setInstas] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(u => {
      setUser(u);
      if (!u) {
        setInstas([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeFirestore = firestore()
      .collection('instas')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (!querySnapshot || !querySnapshot.docs) {
            setInstas([]);
            return;
          }
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
        },
        error => {
          console.error('Firestore snapshot error: ', error);
          setInstas([]);
        },
      );
    return () => unsubscribeFirestore();
  }, [user]);

  const renderItem = ({item}) => <Insta key={item.id} {...item} />;

  return (
    <FlatList
      data={instas}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={3}
    />
  );
}
