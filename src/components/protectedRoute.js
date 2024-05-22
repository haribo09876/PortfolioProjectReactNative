import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase';

export default function ProtectedRoute({children}) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    navigation.navigate('LoginPage');
    return null;
  }
  return children;
}
