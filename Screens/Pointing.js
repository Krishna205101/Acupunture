import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { captureScreen, captureRef } from "react-native-view-shot";
import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export default function Pointing(props) {

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [points, setPoints] = useState([])
  const viewRef = useRef(null);
  const [link, setLink] = useState("")
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    // Change the state every second or the time given by User.
    // const interval = setInterval(() => {
    //   setShowText((showText) => !showText);
    // }, 100);
    // return () => clearInterval(interval);
  }, []);

  const htmlContent = `<!DOCTYPE html>
  <html>
  <body>
  <img src="data:image/png;base64, ${link}" width="100%" height="100%" style="position : fixed">
  </body>
  </html>`


  const handlePress = (evt) => {
    let x = evt.nativeEvent.locationX
    let y = evt.nativeEvent.locationY
    setX(evt.nativeEvent.locationX)
    setY(evt.nativeEvent.locationY)
    setPoints((prev) => {
      return [
        ...prev,
        { 'x': Math.ceil(x) - 5, 'y': Math.ceil(y) - 5 }
      ]
    })
  }

  const deleteItem = (x, y) => {
    setPoints((prev) => {
      return prev.filter(item => item.x != x && item.y != y)
    })
  }

  const createPDF = async () => {

    Print.printAsync(
      {
        html: htmlContent
      },
    ).then(res => console.log(res))

    // FileSystem.downloadAsync(
    //   link,
    //   FileSystem.documentDirectory + 'small.png'
    // )
    //   .then(({ uri }) => {
    //     console.log('Finished downloading to ', uri);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });

  };

  const sharePDF = () => {
    captureRef(viewRef, {
      format: "webm",
      quality: 0.5,
      result: 'base64'
    }).then(
      uri => {
        setLink(uri)
        Print.printToFileAsync(
          {
            html: `<!DOCTYPE html>
            <html>
            <body>
            <img src="data:image/png;base64, ${uri}" height='900' width='100%'>
            
            </body>
            </html>`
          },
        ).then(res => openShareDialogAsync(res.uri))
      },
      error => console.error("Oops, snapshot failed", error)
    );

  }

  // const sharePDF = async () => {

  //   Print.printToFileAsync({
  //       html: htmlContent,
  //   }).then(res => {
  //       // console.log(res.uri)
  //       openShareDialogAsync(res.uri)
  //   })


  async function openShareDialogAsync(link) {
    if (!(await Sharing.isAvailableAsync())) {
      alert(`Uh oh, sharing isn't available on your platform`);
      return;
    }
    Sharing.shareAsync(link);
  };

  const getImage = () => {
    captureRef(viewRef, {
      format: "webm",
      quality: 0.5,
      result: 'base64'
    }).then(
      uri => {
        setLink(uri)
        Print.printAsync(
          {
            html: `<!DOCTYPE html>
            <html>
            <body>
            <img src="data:image/png;base64, ${uri}" height='900' width='100%'>
            
            </body>
            </html>`
          },
        ).then(res => console.log(res))
      },
      error => console.error("Oops, snapshot failed", error)
    );

  }

  const backup = async () => {
    FileSystem.getInfoAsync(`${link}`).then(res => {
      console.log(res)
    })
  }

  return (
    <View style={styles.container}>
      <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
        <Ionicons name="print" size={40} onPress={getImage} />
        <Ionicons name="share-social-sharp" size={40} onPress={sharePDF} />
      </View>
      <ImageBackground source={require('../assets/leftPalm.png')} style={styles.image} resizeMode="stretch" ref={viewRef}>
        <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={(evt) => handlePress(evt)}>
          {points.map((item, index) => (
            <View key={index}>
              <TouchableOpacity activeOpacity={1} style={[styles.point, { position: 'absolute', left: item.x, top: item.y, height: 10, width: 10, opacity: 1 }]} onPress={() => deleteItem(item.x, item.y)}></TouchableOpacity>
              <TouchableOpacity activeOpacity={1} style={[styles.point, { position: 'absolute', left: item.x - 2.5, top: item.y - 2.5, height: 15, width: 15, opacity: 0.5 }]} onPress={() => deleteItem(item.x, item.y)}></TouchableOpacity>
              <TouchableOpacity activeOpacity={1} style={[styles.point, { position: 'absolute', left: item.x - 5, top: item.y - 5, height: 20, width: 20, opacity: 0.3 }]} onPress={() => deleteItem(item.x, item.y)}></TouchableOpacity>
            </View>
          )
          )}
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  point: {
    position: 'absolute',
    backgroundColor: "red",
    borderRadius: 100,
  }
});