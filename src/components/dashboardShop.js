import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const DashboardShop = () => {
  const [data, setData] = useState({
    labels: [],
    legend: [],
    data: [],
    barColors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesSnapshot = await firestore().collection('sales').get();
        const salesData = salesSnapshot.docs.map(doc => doc.data());
        let total = 0;
        const itemTotals = {};
        const groupedData = {};

        for (const sale of salesData) {
          const date = sale.createdAt.toDate().toISOString().split('T')[0];
          const itemTitle = sale.itemTitle;
          const itemPrice = sale.itemPrice;

          total += itemPrice;
          itemTotals[itemTitle] = (itemTotals[itemTitle] || 0) + itemPrice;

          if (!groupedData[date]) groupedData[date] = {};
          groupedData[date][itemTitle] =
            (groupedData[date][itemTitle] || 0) + itemPrice;
        }

        const labels = Object.keys(groupedData).sort();

        const legend = Array.from(
          new Set(Object.values(groupedData).flatMap(obj => Object.keys(obj))),
        );

        const chartData = labels.map(date =>
          legend.map(title => groupedData[date][title] || 0),
        );

        const pieColors = [
          '#4e79a7',
          '#f28e2b',
          '#e15759',
          '#76b7b2',
          '#59a14f',
          '#edc949',
        ];

        const pie = Object.entries(itemTotals).map(([title, amount], idx) => ({
          name: title,
          amount,
          color: pieColors[idx % pieColors.length],
          legendFontColor: '#333',
          legendFontSize: 13,
        }));

        setData({labels, legend, data: chartData, barColors: pieColors});
        setTotalSales(total);
        setPieData(pie);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4e79a7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 누적 최대값 (날짜별 총 매출액) 구하기
  const maxTotalPerDay = Math.max(
    ...data.data.map(dayData => dayData.reduce((a, b) => a + b, 0)),
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>총 매출액</Text>
        <Text style={styles.cardValue}>{totalSales.toLocaleString()} 원</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          일자별 아이템별 매출 현황 (Stacked Bar Chart)
        </Text>
        {data.labels.map((date, dateIdx) => {
          const dayData = data.data[dateIdx];
          const dayTotal = dayData.reduce((a, b) => a + b, 0);

          return (
            <View key={dateIdx} style={styles.barRow}>
              <Text style={styles.barDate}>{date}</Text>
              <View style={styles.barGroup}>
                {/* 누적 막대 표시 */}
                <View style={styles.stackedBar}>
                  {dayData.map((amount, idx) => {
                    if (amount === 0) return null;
                    const widthPercent = (amount / maxTotalPerDay) * 100;
                    return (
                      <View
                        key={idx}
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor:
                            data.barColors[idx % data.barColors.length],
                          height: 24,
                          borderTopLeftRadius: idx === 0 ? 12 : 0,
                          borderBottomLeftRadius: idx === 0 ? 12 : 0,
                          borderTopRightRadius:
                            idx === dayData.length - 1 ? 12 : 0,
                          borderBottomRightRadius:
                            idx === dayData.length - 1 ? 12 : 0,
                        }}
                      />
                    );
                  })}
                </View>
                {/* 아이템별 비율 텍스트 */}
                <View style={styles.percentageLabels}>
                  {dayData.map((amount, idx) => {
                    if (amount === 0) return null;
                    const percent = ((amount / dayTotal) * 100).toFixed(1);
                    return (
                      <Text
                        key={idx}
                        style={[
                          styles.percentageLabel,
                          {color: data.barColors[idx % data.barColors.length]},
                        ]}>
                        {data.legend[idx]}: {percent}%
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          아이템별 전체 매출 비율 (Pie Chart)
        </Text>
        <PieChart
          data={pieData}
          width={screenWidth - 48}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
          hasLegend={false}
        />
        <View style={styles.customLegendContainer}>
          {pieData.map((slice, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View
                style={[styles.legendColorBox, {backgroundColor: slice.color}]}
              />
              <Text style={styles.legendText}>{slice.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4e79a7',
    textAlign: 'center',
  },
  stackedBar: {
    flexDirection: 'row',
    width: '100%',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  barRow: {
    marginBottom: 22,
  },
  barDate: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  barGroup: {
    marginLeft: 6,
  },
  percentageLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 12,
  },
  percentageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  customLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColorBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 15,
    color: '#444',
  },
});

export default DashboardShop;
