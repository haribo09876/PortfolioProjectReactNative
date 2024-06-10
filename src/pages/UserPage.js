import {View, Text, StyleSheet} from 'react-native';
import UserTweet from '../components/userTweet';
import UserInsta from '../components/userInsta';
import UserInfo from '../components/userInfo';

function UserPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Info</Text>
      <UserInfo />
      <Text style={styles.text}>My Tweets</Text>
      <UserTweet />
      <Text style={styles.text}>My Instas</Text>
      <UserInsta />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default UserPage;
