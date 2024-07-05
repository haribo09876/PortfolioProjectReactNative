import {View, Text, StyleSheet, ScrollView} from 'react-native';
import DashboardShop from '../components/dashboardShop';

function DashboardPage() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Dashboard Location</Text>
        {/* <DashboardLocation /> */}
        <Text style={styles.sectionTitle}>Dashboard Shop</Text>
        <DashboardShop />
        <Text style={styles.sectionTitle}>Dashboard Tweet</Text>
        {/* <DashboardTweet /> */}
        <Text style={styles.sectionTitle}>Dashboard Insta</Text>
        {/* <DashboardInsta /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '400',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default DashboardPage;
