import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const API_KEY = '174580b1f4ee4ec1e406e56c83717aed';

export default function Weather() {
  const [location, setLocation] = useState(true);
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=37.531&lon=126.9814&appid=${API_KEY}`;

  const icons = {
    Clouds: 'weather-cloudy',
    Clear: 'weather-sunny',
    Atmosphere: 'foggy',
    Snow: 'weather-snowy-heavy',
    Rain: 'weather-pouring',
    Drizzle: 'weather-fog',
    Thunderstorm: 'weather-lightning',
  };

  // 위치 설정
  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  }, []);

  // 위도, 경도 설정
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true, // 배터리를 더 소모하여 보다 정확한 위치 추적
        timeout: 20000,
        maximumAge: 0, // 한 번 찾은 위치 정보를 해당 초만큼 캐싱
        distanceFilter: 1,
      },
    );
    // 컴포넌트 언마운트 시 위치 업데이트 중지
    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    // 날씨 설정
    const getWeather = axios.get(url).then(
      response => {
        setCity(response.data.city.name);
        setDays(response.data.list);
      },
      error => {
        console.log(error);
      },
    );
  }, [url]);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}>
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color="white"
              style={{marginTop: 10}}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  width: '100%',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp - 273).toFixed(1)}&#8451;
                </Text>
                <Icon
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="white"
                />
              </View>
              <Text style={styles.description}>
                {day.dt_txt.substring(5, 7)}월 {day.dt_txt.substring(8, 10)}일
                {day.dt_txt.substring(11, 13)}시
              </Text>

              <Text style={styles.tinyText}>{day.weather[0].main}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightskyblue',
  },
  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 58,
    fontWeight: '500',
    color: 'white',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  temp: {
    marginTop: 50,
    fontWeight: '600',
    fontSize: 100,
    color: 'white',
  },
  description: {
    marginTop: -10,
    fontSize: 30,
    color: 'white',
    fontWeight: '500',
  },
  tinyText: {
    marginTop: -5,
    fontSize: 25,
    color: 'white',
    fontWeight: '500',
  },
});
