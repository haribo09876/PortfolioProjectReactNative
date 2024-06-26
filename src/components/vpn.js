import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Vpn = () => {
  const [vpnConnected, setVpnConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleVpnConnection = () => {
    setLoading(true); // Show loading indicator during connection attempt

    // Simulating VPN connection toggle (replace with actual logic)
    setTimeout(() => {
      setVpnConnected(!vpnConnected);
      setLoading(false);
    }, 1500); // Simulating delay for connection (replace with actual connection code)
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>VPN 상태</Text>
      </View>
      <View style={styles.content}>
        <Icon
          name={vpnConnected ? 'shield-check' : 'shield-outline'}
          size={100}
          color={vpnConnected ? 'green' : 'lightgrey'}
        />
        <Text
          style={[
            styles.statusText,
            {color: vpnConnected ? 'green' : 'white'},
          ]}>
          {vpnConnected ? '연결됨' : '연결 안 됨'}
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            vpnConnected
              ? {backgroundColor: '#ff4d4d'}
              : {backgroundColor: '#007bff'},
            loading && {backgroundColor: '#ccc'},
          ]}
          onPress={toggleVpnConnection}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {vpnConnected ? '연결 해제' : '연결하기'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A9A9F5',
  },
  header: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    marginVertical: 20,
    color: 'white',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default Vpn;
