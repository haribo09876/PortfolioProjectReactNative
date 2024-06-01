import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import Timeline from '../components/timeline';

const TweetPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState('');
  const [file, setFile] = useState(null);

  const onChange = text => {
    setTweet(text);
  };

  const handleImageResult = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      Alert.alert('ImagePicker Error', response.errorMessage);
    } else {
      const selectedAsset = response.assets[0];
      if (selectedAsset.uri) {
        const fileSizeInMB = selectedAsset.fileSize / (1024 * 1024);
        if (fileSizeInMB > 3) {
          Alert.alert(
            'File size error',
            'The selected image exceeds the 3MB size limit.',
          );
        } else {
          setFile(selectedAsset);
        }
      }
    }
  };

  const onFileChange = () => {
    Alert.alert(
      'Select Image Source',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await launchCamera({
              mediaType: 'photo',
              cameraType: 'back',
            });
            handleImageResult(result);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await launchImageLibrary({mediaType: 'photo'});
            handleImageResult(result);
          },
        },
      ],
      {cancelable: true},
    );
  };

  const clearFile = () => {
    setFile(null);
  };

  const onSubmit = async () => {
    const user = auth().currentUser;
    if (!user || isLoading || tweet === '' || tweet.length > 180) return;

    try {
      setLoading(true);
      const tweetRef = firestore().collection('tweets').doc();
      const tweetData = {
        tweet,
        createdAt: firestore.FieldValue.serverTimestamp(),
        username: user.displayName || 'Anonymous',
        userId: user.uid,
      };
      await tweetRef.set(tweetData);

      if (file) {
        const storageRef = storage().ref(
          `tweets/${user.uid}-${user.displayName}/${tweetRef.id}`,
        );
        const uploadTask = storageRef.putFile(file.uri);
        uploadTask.on(
          'state_changed',
          snapshot => {},
          error => {
            console.error('Image upload error: ', error);
            Alert.alert(
              'Upload Error',
              'There was an error uploading the image.',
            );
          },
          async () => {
            const url = await storageRef.getDownloadURL();
            await tweetRef.update({photo: url});
            setFile(null);
          },
        );
      }

      setTweet('');
    } catch (error) {
      console.error('Tweet submission error: ', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your tweet.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={onChange}
          value={tweet}
          placeholder="What is happening?!"
          maxLength={180}
          multiline
        />
        {file && (
          <View style={styles.imagePreview}>
            <Image source={{uri: file.uri}} style={styles.image} />
            <TouchableOpacity
              style={styles.clearFileButton}
              onPress={clearFile}
              accessibilityLabel="Remove Image Button"
              accessibilityHint="Remove selected image">
              <Text style={styles.clearFileButtonText}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Add photo" onPress={onFileChange} />
          <Button
            title={isLoading ? 'Posting...' : 'Post Tweet'}
            onPress={onSubmit}
            disabled={!tweet || isLoading}
          />
        </View>
        {isLoading && <ActivityIndicator size="large" color="#1DA1F2" />}
      </View>
      <Timeline />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearFileButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 12,
  },
  clearFileButtonText: {
    color: 'white',
    fontSize: 12,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
});

export default TweetPage;
