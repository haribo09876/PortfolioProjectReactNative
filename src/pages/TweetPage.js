import React from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase';

export default function Layout() {
  const navigation = useNavigation();

  const onLogOut = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          await auth.signOut();
          navigation.navigate('LoginPage');
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.menu}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomePage')}
          style={styles.menuItem}>
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>🏠</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('InstaPage')}
          style={styles.menuItem}>
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>👤</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogOut}
          style={[styles.menuItem, styles.logOut]}>
          <View style={styles.iconWrapper}>
            <Text style={[styles.icon, styles.logOutIcon]}>🚪</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingVertical: 50,
    maxWidth: 860,
    alignSelf: 'center',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  logOut: {
    borderColor: 'tomato',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  logOutIcon: {
    color: 'tomato',
  },
});
