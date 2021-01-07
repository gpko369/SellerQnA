import React, { useState, useEffect } from "react";

import { S3Image } from "./CustomImage";
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  FlatList
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const ImageModal = ({
  imageIndex,
  hideImageModal,
  imageObjs,
  imageModalVisible
}) => {
  const [imgIndex, setImgIndex] = useState(imageIndex);

  useEffect(() => {
    setImgIndex(imageIndex);
  }, [imageIndex]);

  const renderThumbnailImage = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setImgIndex(index);
        }}
        style={{ marginTop: 28 }}
      >
        <S3Image
          imgKey={item.S3ObjectKey}
          style={{ height: 56, width: 56, marginRight: 6 }}
        />
      </TouchableOpacity>
    );
  };
  return imageObjs ? (
    <Modal transparent={true} animationType="fade" visible={imageModalVisible}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center"
        }}
      >
        <View
          style={{
            marginHorizontal: 10,
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: "white",
            borderRadius: 22
          }}
        >
          <TouchableOpacity
            style={{ alignSelf: "flex-end", marginBottom: 10 }}
            onPress={hideImageModal}
          >
            <AntDesign name="close" size={20} color="black" />
          </TouchableOpacity>
          <S3Image
            imgKey={imageObjs[imgIndex]?.S3ObjectKey}
            style={{ width: "100%", height: 400 }}
            resizeMode="contain"
          />
          <View>
            <FlatList
              data={imageObjs}
              renderItem={renderThumbnailImage}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              horizontal={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  ) : null;
};

export default ImageModal;

const styles = StyleSheet.create({});
