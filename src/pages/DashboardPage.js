import {View, Text, StyleSheet} from 'react-native';

function UserPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DashboardPage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default UserPage;
