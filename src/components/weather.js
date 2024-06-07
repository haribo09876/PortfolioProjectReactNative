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

const icons = {
  Clouds: 'weather-cloudy',
  Clear: 'weather-sunny',
  Atmosphere: 'weather-fog',
  Snow: 'snowflake',
  Rain: 'weather-pouring',
  Drizzle: 'weather-fog',
  Thunderstorm: 'weather-lightning',
};

export default function Weather() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    // 위치 권한 요청
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermission(true);
          } else {
            setLocationPermission(false);
          }
        } catch (error) {
          console.error('Error requesting location permission: ', error);
          setLocationPermission(false);
        }
      } else {
        // iOS에서는 기본적으로 위치 권한이 허용되어 있음
        setLocationPermission(true);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      // 위치 설정
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          fetchWeather(latitude, longitude);
        },
        error => {
          console.error('Error getting location: ', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
          distanceFilter: 1,
        },
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    }
  }, [locationPermission]);

  const fetchWeather = async (latitude, longitude) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    try {
      const response = await axios.get(url);
      setCity(response.data.city.name);
      setDays(response.data.list);
    } catch (error) {
      console.error('Error fetching weather data: ', error);
    }
  };

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
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'center',
                }}>
                <Icon
                  name={icons[day.weather[0].main]}
                  size={200}
                  color="white"
                />
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp - 273).toFixed(1)}&#8451;
                </Text>
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
    marginTop: 10,
    fontWeight: '600',
    fontSize: 70,
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
