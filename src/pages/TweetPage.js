import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
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

  const openImagePicker = () => {
    launchImageLibrary({}, response => {
      if (!response.didCancel) {
        setFile(response);
      }
    });
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
        await storageRef.putFile(file.uri);
        const url = await storageRef.getDownloadURL();
        await tweetRef.update({photo: url});
      }

      setTweet('');
      setFile(null);
    } catch (error) {
      console.error(error);
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
        onPress={openImagePicker}
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
