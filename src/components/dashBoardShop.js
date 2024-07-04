import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import {StackedBarChart} from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const DashboardShop = () => {
  const [data, setData] = useState({
    labels: [],
    legend: [],
    data: [],
    barColors: ['#3366FF', '#FF9900', '#109618', '#990099'], // Example colors for itemTitles
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesSnapshot = await firestore().collection('sales').get();
        const salesData = salesSnapshot.docs.map(doc => doc.data());

        // Process data to group by day and sum itemPrice per itemTitle
        const groupedData = salesData.reduce((acc, sale) => {
          const date = sale.createdAt.toDate().toISOString().split('T')[0]; // Format date as YYYY-MM-DD
          const itemTitle = sale.itemTitle;
          const itemPrice = sale.itemPrice;

          if (!acc[date]) {
            acc[date] = {};
          }
          if (!acc[date][itemTitle]) {
            acc[date][itemTitle] = 0;
          }
          acc[date][itemTitle] += itemPrice;

          return acc;
        }, {});

        // Transform groupedData to chart data format
        const labels = Object.keys(groupedData).sort(); // Sort dates in ascending order
        const legend = Array.from(
          new Set(Object.values(groupedData).flatMap(obj => Object.keys(obj))),
        ); // Get all itemTitles
        const data = labels.map(date => {
          return legend.map(title => groupedData[date][title] || 0);
        });

        setData({
          labels,
          legend,
          data,
          barColors: [
            '#3366FF',
            '#FF9900',
            '#109618',
            '#990099',
            '#FF3366',
            '#66FF33',
          ], // Add more colors if necessary
        });
        setLoading(false); // Set loading to false after data is processed
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data'); // Set error state for user feedback
        setLoading(false); // Set loading to false on error
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <StackedBarChart
          data={{
            labels: data.labels,
            legend: data.legend,
            data: data.data,
            barColors: data.barColors,
          }}
          width={screenWidth * data.labels.length} // Adjust the width to accommodate more data
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 15,
            },
            propsForLabels: {
              fontSize: 15,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
});

export default DashboardShop;
