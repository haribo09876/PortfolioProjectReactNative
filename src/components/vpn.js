import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {prepare, connect} from 'react-native-vpn-ipsec';

const Vpn = () => {
  const [isConnected, setIsConnected] = useState(false);
  const address = '219.100.37.109';
  const username = 'vpn';
  const password = 'vpn';

  useEffect(() => {
    const initializeVpn = async () => {
      try {
        await prepare();
        console.log('VPN prepared successfully');
      } catch (error) {
        console.error('Error preparing VPN', error);
      }
    };

    initializeVpn();
  }, []);

  const handleConnect = async () => {
    try {
      await connect(address, username, password);
      setIsConnected(true);
      console.log('VPN connected successfully');
    } catch (error) {
      console.error('Error connecting to VPN', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleConnect} style={styles.button}>
        <Text style={styles.buttonText}>
          {isConnected ? '연결됨' : '연결하기'}
        </Text>
      </TouchableOpacity>
      {isConnected && (
        <Text style={styles.statusText}>VPN에 연결되었습니다.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default Vpn;
