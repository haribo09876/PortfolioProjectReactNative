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

const chartWidth = 220;
const screenWidth = Dimensions.get('window').width;
const calculatedPadding = (screenWidth - chartWidth) / 2;

const pieColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#6366F1',
  '#8B5CF6',
];

const DashboardShop = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [predictedSales, setPredictedSales] = useState(null);
  const [barData, setBarData] = useState({
    labels: [],
    legend: [],
    data: [],
  });
  const [pieData, setPieData] = useState([]);

  // Linear regression for predicting next total sales (단순 선형 회귀를 통한 다음 판매량 예측)
  const predictNextSales = (labels, data) => {
    const totals = data.map(day => day.reduce((a, b) => a + b, 0));
    const n = totals.length;
    if (n < 2) return null; // Not enough data points (데이터 포인트 부족)

    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += totals[i];
      sumXY += i * totals[i];
      sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return Math.round(slope * n + intercept); // Predicted value for next index (다음 시점의 예측값 반환)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore().collection('sales').get(); // Fetch sales data from Firestore (파이어스토어에서 판매 데이터 가져오기)
        const sales = snapshot.docs.map(doc => doc.data());

        let total = 0;
        const itemTotals = {}; // Cumulative total by item (항목별 누적 합계)
        const grouped = {}; // Group by date (날짜별 그룹화)

        for (const sale of sales) {
          const date = sale.createdAt.toDate().toISOString().split('T')[0];
          const title = sale.itemTitle;
          const price = sale.itemPrice;

          total += price;
          itemTotals[title] = (itemTotals[title] || 0) + price;

          if (!grouped[date]) grouped[date] = {};
          grouped[date][title] = (grouped[date][title] || 0) + price;
        }

        const labels = Object.keys(grouped).sort().reverse(); // Descending date order (최신순 정렬)
        const legend = Array.from(
          new Set(Object.values(grouped).flatMap(o => Object.keys(o))),
        ); // Matrix: [date][itemPrice] (날짜별 항목 가격 매트릭스)

        const data = labels.map(date =>
          legend.map(title => grouped[date][title] || 0),
        );

        const pie = Object.entries(itemTotals).map(([title, amount], idx) => ({
          name: title,
          amount,
          color: pieColors[idx % pieColors.length],
          legendFontColor: '#333',
          legendFontSize: 13,
        }));

        const predicted = predictNextSales(labels, data); // Predict next day sales (다음 판매 예측)

        setBarData({labels, legend, data});
        setPieData(pie);
        setTotalSales(total);
        setPredictedSales(predicted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
        setLoading(false);
      }
    };
    fetchData(); // Initial data load on mount (마운트 시 데이터 로딩)
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        {/* Loading spinner (로딩 스피너) */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        {/* Error message (에러 메시지 출력) */}
      </View>
    );
  }

  const maxPerDay = Math.max(
    ...barData.data.map(day => day.reduce((a, b) => a + b, 0)),
  ); // Maximum sales in a day (일 최대 판매량 계산)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total sales</Text>
          <Text style={styles.money}>{totalSales.toLocaleString()}원</Text>
        </View>
        {predictedSales !== null && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Predicted next sales</Text>
              <Text style={styles.money}>
                {predictedSales.toLocaleString()}원
              </Text>
            </View>
          </>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily sales</Text>
          {barData.labels.map((date, idx) => {
            const values = barData.data[idx];
            const dayTotal = values.reduce((a, b) => a + b, 0); // Total per date (해당 날짜의 총합)
            return (
              <View key={idx} style={styles.barRow}>
                <Text style={styles.barDate}>{date}</Text>
                <View style={styles.stackedBar}>
                  {values.map((v, i) => {
                    if (v === 0) return null;
                    const widthPercent = (v / maxPerDay) * 100; // Relative width by item (항목별 상대 너비 계산)
                    return (
                      <View
                        key={i}
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: pieColors[i % pieColors.length],
                          height: 22,
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales ratio by item</Text>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft={`${calculatedPadding}`}
            absolute
            hasLegend={false} // Custom legend used (커스텀 범례 사용)
          />
          <View style={styles.customLegendContainer}>
            {pieData.map((slice, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColorBox,
                    {backgroundColor: slice.color},
                  ]}
                />
                <Text style={styles.legendText}>{slice.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#EF4444',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 20,
  },
  money: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(68, 88, 200, 1)',
    marginLeft: 10,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  barRow: {
    marginLeft: 10,
    marginBottom: 15,
  },
  barDate: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
    color: 'rgba(89, 89, 89, 1)',
  },
  stackedBar: {
    flexDirection: 'row',
    width: '100%',
    height: 22,
    overflow: 'hidden',
  },
  customLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColorBox: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 6,
  },
  legendText: {
    fontSize: 15,
    color: 'rgba(89, 89, 89, 1)',
    fontWeight: '500',
  },
});

export default DashboardShop;
