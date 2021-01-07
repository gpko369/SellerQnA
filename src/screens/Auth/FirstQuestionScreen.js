import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Modal,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  Image
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../../graphql/mutations";

import TextInputHeader from "../Header/TextInputHeader";

import { AuthContext } from "../../context/AuthContext";

import { uploadImage, imagePicker } from "../../utility/imageUploader";

import { v4 as uuid } from "react-native-uuid";

import {
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  AntDesign
} from "@expo/vector-icons";

const limitOfImages = 3;

const FirstQuestionScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUris, setImageUris] = useState([]);
  const [questionUploaded, setQuestionUploaded] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { setPhoneBool, checkAuth } = useContext(AuthContext);
  const [user, setUser] = useState(route.params.user);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const QuestionSubmitModal = () => (
    <Modal transparent={true} animationType="fade" visible={modalVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Feather
            style={{ marginBottom: 10 }}
            name="check-circle"
            size={60}
            color="#31D856"
          />
          <Text style={{ ...styles.modalText, fontWeight: "bold" }}>
            질문이
          </Text>
          <Text style={styles.modalText}>업로드 되었습니다.</Text>
        </View>
      </View>
    </Modal>
  );

  const submitQuestion = async () => {
    //check for condition
    if (title.length < 2) {
      Alert.alert("제목은 2자 이상 입력해주세요");
    } else if (content.length < 10) {
      Alert.alert("내용은 10자 이상 입력해주세요.");
    } else {
      // mutation creating new question with given parameters
      Alert.alert(
        "질문을 올리시겠습니까?",
        "",
        [
          {
            text: "아니오",
            style: "cancel"
          },
          {
            text: "예",
            onPress: async () => {
              try {
                Keyboard.dismiss();
                const result = await API.graphql(
                  graphqlOperation(mutations.createQuestion, {
                    input: {
                      userID: user.sub,
                      title: title,
                      content: content,
                      //Adjust for Korean timezone
                      closed: false,
                      createdAt: Date.now() + 32400000,
                      private: route.params?.isPrivate ? true : false
                    }
                  })
                );
                // const imageS3Keys = await Promise.all(
                //   imageUris.map((uri) => {
                //     return uploadImage(uri.uri);
                //   })
                // );
                const image = imageUris.map(async (imgObj, idx) => {
                  return await API.graphql(
                    graphqlOperation(mutations.createImage, {
                      input: {
                        order: idx + 1,
                        questionID: result.data.createQuestion.id,
                        S3ObjectKey: imgObj.key
                      }
                    })
                  );
                });
                setModalVisible(true);
                setTimeout(() => {
                  setModalVisible(false);
                  setPhoneBool(true);
                  checkAuth();
                }, 3000);
              } catch (err) {
                console.log(err);
              }
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  const ImageModal = () => {
    const [imgIndex, setImgIndex] = useState(imageIndex);

    const renderThumbnailImage = ({ item, index }) => {
      return (
        <TouchableOpacity
          onPress={() => setImgIndex(index)}
          style={{ marginTop: 28 }}
        >
          <Image
            source={{ uri: item.uri }}
            style={{ height: 56, width: 56, marginRight: 6 }}
          />
        </TouchableOpacity>
      );
    };

    return imageUris.length > 0 ? (
      <Modal transparent={true} visible={imageModalVisible}>
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
              style={{ alignSelf: "flex-end" }}
              onPress={() => setImageModalVisible(false)}
            >
              <AntDesign name="close" size={20} color="black" />
            </TouchableOpacity>
            <Image
              source={{ uri: imageUris[imgIndex].uri }}
              style={{ width: "100%", height: 400 }}
              resizeMode="contain"
            />
            <View>
              <FlatList
                data={imageUris}
                renderItem={renderThumbnailImage}
                keyExtractor={(item) => item.key + "abc"}
                scrollEnabled={false}
                horizontal={true}
              />
            </View>
          </View>
        </View>
      </Modal>
    ) : null;
  };

  const addImage = async () => {
    if (limitOfImages > imageUris.length) {
      if (!imageUploading) {
        setImageUploading(true);
        let uri = await imagePicker();
        if (uri) {
          const imageUriTemp = imageUris;
          setImageUris((prev) => [...prev, { uri: uri, state: "loading" }]);
          let key = await uploadImage(uri);
          if (key) {
            setImageUris([...imageUriTemp, { uri: uri, key: key }]);
          }
          setImageUploading(false);
        } else setImageUploading(false);
      } else {
        Alert.alert("이미지 업로드 중입니다.");
      }
    } else {
      Alert.alert("최대 3장까지만 업로드하실 수 있습니다.");
    }
  };

  const deleteImage = async (index) => {
    Alert.alert("해당 이미지를 삭제하시겠습니까?", "", [
      { text: "아니오", style: "cancel" },
      {
        text: "예",
        onPress: async () => {
          try {
            const res = await Storage.remove(imageUris[index].key);
            console.log(res);
            let prevUris = imageUris;
            prevUris.splice(index, 1);
            setImageUris([...prevUris]);
          } catch (err) {
            console.log(err);
            Alert.alert("이미지 삭제에 실패했습니다. 다시 시도해주세요.");
          }
        }
      }
    ]);
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => viewImage(index)}>
        <ImageModal />
        <ImageBackground
          source={{ uri: item.uri }}
          style={{
            width: 60,
            height: 60,
            marginLeft: 10,
            marginBottom: 10,
            alignItems: item.state == "loading" ? "stretch" : "flex-end"
          }}
        >
          {item.state == "loading" ? (
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(222,222,222,0.4)",
                justifyContent: "center"
              }}
            >
              <ActivityIndicator
                size="large"
                color="#eb4c2a"
                style={{
                  opacity: 1
                }}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => deleteImage(index)}
              style={{
                backgroundColor: "white",
                width: 20,
                height: 20,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                margin: 5
              }}
            >
              <FontAwesome name="remove" size={16} color="black" />
            </TouchableOpacity>
          )}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const viewImage = (index) => {
    setImageIndex(index);
    if (!imageModalVisible) setImageModalVisible(true);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : null}
        enabled
        style={{ flex: 1 }}
        keyboardVerticalOffset={40}
      >
        <QuestionSubmitModal />
        <TextInputHeader
          inputText={title}
          setInputText={setTitle}
          goBack={() => navigation.pop()}
          placeholder="제목을 입력해주세요."
        />
        <View style={styles.container}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.content}
              placeholder="내용을 입력하세요."
              value={content}
              onChangeText={(text) => setContent(text)}
              multiline={true}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.cameraIcon} onPress={addImage}>
              <MaterialCommunityIcons
                name="camera-plus"
                size={30}
                color="black"
              />
            </TouchableOpacity>
            <FlatList
              data={imageUris}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              horizontal={true}
            />
          </View>
          <TouchableOpacity
            onPress={submitQuestion}
            style={styles.submitButton}
          >
            <View>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
              >
                질문하고 시작하기
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default FirstQuestionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: "#EB4C2A",
    borderTopWidth: 1
  },
  title: {
    width: 200,
    borderColor: "#000",
    borderWidth: 1
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  cameraIcon: {
    marginLeft: 20,
    marginBottom: 20,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 5
  },
  arrowBox: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6F4B",
    borderRadius: 5
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: 300,
    height: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  modalText: {
    color: "#000000",
    fontSize: 24
  },
  modal: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.45,
    shadowRadius: 7,

    elevation: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 96,
    paddingHorizontal: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "white"
  },
  submitButton: {
    backgroundColor: "#FF6F4A",
    height: 76,
    justifyContent: "center",
    alignItems: "center"
  }
});
