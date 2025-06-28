import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Shop from './shop';

export default function ShopTimeline() {
  const [shops, setShops] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(u => {
      setUser(u);
      if (!u) {
        setShops([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeFirestore = firestore()
      .collection('shops')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (!querySnapshot || !querySnapshot.docs) {
            setShops([]);
            return;
          }
          const updatedShops = querySnapshot.docs.map(doc => {
            const {
              itemTitle,
              itemPrice,
              itemDetail,
              createdAt,
              userId,
              username,
              photo,
            } = doc.data();
            return {
              itemTitle,
              itemPrice,
              itemDetail,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id,
            };
          });
          setShops(updatedShops);
        },
        error => {
          console.error('Firestore snapshot error: ', error);
          setShops([]);
        },
      );
    return () => unsubscribeFirestore();
  }, [user]);

  const renderItem = ({item}) => <Shop key={item.id} {...item} />;

  return (
    <FlatList
      data={shops}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={2}
    />
  );
}
