import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  saveConfig,
  prepare,
  connect,
  disconnect,
  getCurrentState,
  VpnState,
  CharonErrorState,
  onStateChangedListener,
  removeOnStateChangeListener,
} from 'react-native-vpn-ipsec';

const Vpn = () => {
  const [vpnConnected, setVpnConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentState, setCurrentState] = useState(VpnState.disconnected);

  // VPN 연결 준비
  useEffect(() => {
    const setupVpn = async () => {
      try {
        await prepare();
        console.log('VPN 준비 완료');
      } catch (error) {
        console.error('VPN 준비 중 오류 발생:', error);
      }
    };

    setupVpn();
  }, []);

  // VPN 상태 변경 리스너 등록
  useEffect(() => {
    const stateChangeListener = onStateChangedListener(({state}) => {
      setCurrentState(state);
    });

    return () => {
      removeOnStateChangeListener(stateChangeListener);
    };
  }, []);

  const toggleVpnConnection = async () => {
    setLoading(true);

    try {
      if (vpnConnected) {
        // VPN 연결 해제
        await disconnect();
        setVpnConnected(false);
      } else {
        // VPN 연결 설정
        const vpnConfig = {
          address: 'public-vpn-98.opengw.net',
          username: 'vpn',
          password: 'vpn',
          vpnType: undefined, // Currently not implemented
          mtu: undefined, // Currently not implemented
        };

        await saveConfig(
          'MyVPN',
          vpnConfig.address,
          vpnConfig.username,
          vpnConfig.password,
          vpnConfig.password,
        );
        await connect(
          'MyVPN',
          vpnConfig.address,
          vpnConfig.username,
          vpnConfig.password,
          vpnConfig.vpnType,
          vpnConfig.mtu,
        );
        setVpnConnected(true);
      }
    } catch (error) {
      Alert.alert('오류 발생', error.message);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.currentStateText}>
          현재 상태:{' '}
          {currentState === VpnState.connected ? '연결됨' : '연결 안 됨'}
        </Text>
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
  currentStateText: {
    marginTop: 20,
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
