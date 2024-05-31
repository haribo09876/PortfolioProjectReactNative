import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

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
          snapshot => {
            // Progress feedback can be added here if desired
          },
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
      <TextInput
        style={styles.textInput}
        onChangeText={onChange}
        value={tweet}
        placeholder="What is happening?!"
        maxLength={180}
        multiline
      />
      <Button
        title={file ? 'Photo added ✅' : 'Add photo'}
        onPress={onFileChange}
      />
      {file && (
        <TouchableOpacity
          style={styles.clearFileButton}
          onPress={clearFile}
          accessibilityLabel="Remove Image Button"
          accessibilityHint="Remove selected image">
          <Text style={styles.clearFileButtonText}>Remove Image ❌</Text>
        </TouchableOpacity>
      )}
      <Button
        title={isLoading ? 'Posting...' : 'Post Tweet'}
        onPress={onSubmit}
        disabled={!tweet || isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  textInput: {
    marginBottom: 10,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  clearFileButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  clearFileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TweetPage;
