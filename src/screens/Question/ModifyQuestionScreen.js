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
  SafeAreaView,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  Image
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";
import ImageModal from "../../components/ImageModal";

import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import TextInputHeader from "../Header/TextInputHeader";
import { Storage } from "aws-amplify";

import { AuthContext } from "../../context/AuthContext";
import { S3Image } from "../../components/CustomImage";

import { uploadImage, imagePicker } from "../../utility/imageUploader";
import { S3ImageBackground } from "../../components/CustomImage";

import { v4 as uuid } from "react-native-uuid";

import {
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  AntDesign
} from "@expo/vector-icons";
import { contextType } from "lottie-react-native";

const limitOfImages = 3;

const ModifyQuestionScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [questionObj, setQuestionObj] = useState(null);
  const [imageUris, setImageUris] = useState([]);
  const [questionUploaded, setQuestionUploaded] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [imagesDeleted, setImagesDeleted] = useState([]);
  const [initialContent, setInitialContent] = useState("");
  const [initialTitle, setInitialTitle] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (title || content || imageUris[0]) {
      if (questionUploaded) {
        setHasUnsavedChanges(false);
      } else if (title === initialTitle && content === initialContent) {
        setHasUnsavedChanges(false);
      } else {
        setHasUnsavedChanges(true);
      }
    } else {
      setHasUnsavedChanges(false);
    }
  }, [
    title,
    content,
    imageUris,
    questionUploaded,
    initialTitle,
    initialContent
  ]);

  const getQuestion = async () => {
    try {
      const question = await API.graphql(
        graphqlOperation(queries.getQuestion, { id: route.params.questionID })
      );
      setTitle(question.data.getQuestion.title);
      setInitialTitle(question.data.getQuestion.title);
      setInitialContent(question.data.getQuestion.content);
      setContent(question.data.getQuestion.content);
      setQuestionObj(question.data.getQuestion);
      let images = question.data.getQuestion.images.items;
      images.map((image) => {
        image.state = "none";
        return image;
      });
      setImageUris(images);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    getQuestion();
  }, []);

  useEffect(() => {
    if (questionUploaded) {
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.pop();
      }, 3000);
    }
  }, [questionUploaded]);

  useEffect(() => {
    const unsubscribeBeforeRemove = navigation.addListener(
      "beforeRemove",
      (e) => {
        if (!hasUnsavedChanges || questionUploaded) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          "현재 작성 중인 내용이 모두 지워집니다. 떠나시겠습니까?",
          "",
          [
            { text: "아니요", style: "cancel", onPress: () => {} },
            {
              text: "예",
              style: "destructive",
              // If the user confirmed, then we dispatch the action we blocked earlier
              // This will continue the action that had triggered the removal of the screen
              onPress: () => navigation.dispatch(e.data.action)
            }
          ]
        );
      }
    );
    return unsubscribeBeforeRemove;
  }, [navigation, hasUnsavedChanges, questionUploaded]);

  const QuestionSubmitModal = () => (
    <Modal transparent={true} visible={modalVisible}>
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
          <Text style={styles.modalText}>수정되었습니다.</Text>
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
        "질문을 수정하시겠습니까?",
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
                const result = await API.graphql(
                  graphqlOperation(mutations.updateQuestion, {
                    input: {
                      id: route.params.questionID,
                      title: title,
                      content: content
                      //Adjust for Korean timezone
                    }
                  })
                );
                await Promise.all(
                  imagesDeleted.map(async (image) => {
                    await API.graphql(
                      graphqlOperation(mutations.deleteImage, {
                        input: { id: image.id }
                      })
                    );
                  })
                );
                const image = await Promise.all(
                  imageUris.map(async (imgObj, idx) => {
                    if (imgObj.uri) {
                      return await API.graphql(
                        graphqlOperation(mutations.createImage, {
                          input: {
                            order: idx + 1,
                            questionID: route.params.questionID,
                            S3ObjectKey: imgObj.S3ObjectKey
                          }
                        })
                      );
                    } else {
                      return await API.graphql(
                        graphqlOperation(mutations.updateImage, {
                          input: {
                            id: imgObj.id,
                            order: idx + 1
                          }
                        })
                      );
                    }
                  })
                );
                setQuestionUploaded(true);
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

  // const ImageModal = () => {
  //   const [imgIndex, setImgIndex] = useState(imageIndex);

  //   const renderThumbnailImage = ({ item, index }) => {
  //     return (
  //       <TouchableOpacity
  //         onPress={() => setImgIndex(index)}
  //         style={{ marginTop: 28 }}
  //       >
  //         <S3Image
  //           imgKey={item.S3ObjectKey}
  //           style={{ height: 56, width: 56, marginRight: 6 }}
  //         />
  //       </TouchableOpacity>
  //     );
  //   };

  //   return (
  //     <Modal transparent={true} visible={imageModalVisible}>
  //       <View
  //         style={{
  //           flex: 1,
  //           backgroundColor: "rgba(0,0,0,0.4)",
  //           justifyContent: "center"
  //         }}
  //       >
  //         <View
  //           style={{
  //             marginHorizontal: 10,
  //             paddingTop: 20,
  //             paddingHorizontal: 20,
  //             paddingBottom: 20,
  //             backgroundColor: "white",
  //             borderRadius: 22
  //           }}
  //         >
  //           <TouchableOpacity
  //             style={{ alignSelf: "flex-end" }}
  //             onPress={() => setImageModalVisible(false)}
  //           >
  //             <AntDesign name="close" size={20} color="black" />
  //           </TouchableOpacity>
  //           <S3Image
  //             imgKey={imageUris[imgIndex]?.S3ObjectKey}
  //             style={{ width: "100%", height: 400 }}
  //             resizeMode="contain"
  //           />
  //           <View>
  //             <FlatList
  //               data={imageUris}
  //               renderItem={renderThumbnailImage}
  //               keyExtractor={(item) => item.S3ObjectKey + "abc"}
  //               scrollEnabled={false}
  //               horizontal={true}
  //             />
  //           </View>
  //         </View>
  //       </View>
  //     </Modal>
  //   );
  // };

  const addImage = async () => {
    if (limitOfImages > imageUris.length) {
      if (!imageUploading) {
        setImageUploading(true);
        let uri = await imagePicker();
        if (uri) {
          const imageUriTemp = imageUris;
          setImageUris((prev) => [
            ...prev,
            { uri: uri, state: "new", loading: true }
          ]);
          let key = await uploadImage(uri);
          if (key) {
            setImageUris([
              ...imageUriTemp,
              { uri: uri, S3ObjectKey: key, state: "new" }
            ]);
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
    Alert.alert(
      "해당 이미지를 삭제하시게 되면 다시 되돌릴 수 없습니다. 계속 하시겠습니까?",
      "",
      [
        { text: "아니오", style: "cancel" },
        {
          text: "예",
          onPress: async () => {
            try {
              if (!imageUris[index].uri) {
                setImagesDeleted((prev) => [...prev, imageUris[index]]);
              } else {
                const res = await Storage.remove(imageUris[index].S3ObjectKey);
              }
              let prevUris = imageUris;
              prevUris.splice(index, 1);
              setImageUris([...prevUris]);
            } catch (err) {
              console.log(err);
              Alert.alert("이미지 삭제에 실패했습니다. 다시 시도해주세요.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => viewImage(index)}>
        {item.uri ? (
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
            {item.loading == true ? (
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
        ) : (
          <S3ImageBackground
            imgKey={item.S3ObjectKey}
            style={{
              width: 60,
              height: 60,
              marginLeft: 10,
              marginBottom: 10,
              alignItems: item.state == "loading" ? "stretch" : "flex-end"
            }}
          >
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
          </S3ImageBackground>
        )}
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
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <SafeAreaView />
        <ImageModal
          imageIndex={imageIndex}
          hideImageModal={() => setImageModalVisible(false)}
          imageObjs={imageUris}
          imageModalVisible={imageModalVisible}
        />
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
            keyExtractor={(item) => item.S3ObjectKey}
            horizontal={true}
          />
        </View>
        <TouchableOpacity
          activeOpacity={hasUnsavedChanges ? 1 : 0.2}
          onPress={hasUnsavedChanges ? submitQuestion : null}
          style={{
            ...styles.submitButton,
            backgroundColor: hasUnsavedChanges ? "#FF6F4A" : "#C4C4C4"
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
              질문 수정하기
            </Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default ModifyQuestionScreen;

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
    paddingTop: 20,
    lineHeight: 24
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
