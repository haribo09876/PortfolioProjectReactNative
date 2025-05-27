import {View, Text, StyleSheet, ScrollView} from 'react-native';
import DashboardLocation from '../components/dashboardLocation';
import DashboardShop from '../components/dashboardShop';

function DashboardPage() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Sales</Text>
        <DashboardShop />
        <Text style={styles.sectionTitle}>Location</Text>
        <DashboardLocation />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    margin: 20,
  },
  sectionTitle: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 20,
  },
});

export default DashboardPage;
