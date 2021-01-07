import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  ImageBackground
} from "react-native";
import { Storage } from "aws-amplify";

const CustomImage = (props) => {
  const [uri, setUri] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0.8)).current;

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true
    }).start();
  };

  const getImageSource = () => {
    Storage.get(props.imgKey, { level: "public" })
      .then((url) => {
        setUri(url);
      })
      .catch((err) => console.log(err));
  };

  const load = () => {
    if (!props.imgKey) {
      return;
    }

    if (props.body) {
      const type = props.contentType
        ? props.contentType
        : "binary/octet-stream";
      const opt = {
        contentType: type,
        level: "public"
      };
      const ret = Storage.put(props.imgKey, props.body, opt);
      ret
        .then((data) => {
          console.log(data);
          getImageSource();
        })
        .catch((err) => console.log(err));
    } else {
      getImageSource();
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
  }, [props]);

  if (uri) {
    return (
      <View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image {...props} source={{ uri: uri }} onLoad={fadeIn} />
        </Animated.View>
        {loading && (
          <View
            {...props}
            style={{
              ...props.style,
              backgroundColor: "lightgrey",
              position: "absolute"
            }}
          />
        )}
      </View>
    );
  } else {
    return (
      <View
        {...props}
        style={{
          ...props.style,
          backgroundColor: "lightgrey"
        }}
      />
    );
  }
};

const CustomImageBackground = (props) => {
  const [uri, setUri] = useState("");
  const fadeAnim = useRef(new Animated.Value(0.7)).current;

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true
    }).start();
  };

  const getS3Image = async () => {
    try {
      const url = await Storage.get(props.imgKey);
      setUri(url);
      fadeIn();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getS3Image();
  }, [props]);

  if (uri) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <ImageBackground {...props} source={{ uri: uri }} />
      </Animated.View>
    );
  } else {
    return <View style={{ ...props?.style, backgroundColor: "lightgrey" }} />;
  }
};

export { CustomImage as S3Image, CustomImageBackground as S3ImageBackground };

const styles = StyleSheet.create({});
