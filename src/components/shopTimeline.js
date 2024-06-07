import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Shop from './shop';

export default function ShopTimeline() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('shops')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
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
      });

    return () => unsubscribe();
  }, []);

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
