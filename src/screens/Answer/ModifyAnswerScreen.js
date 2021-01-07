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
  ScrollView,
  FlatList,
  Image,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";
import { S3ImageBackground } from "../../components/CustomImage";
import ImageModal from "../../components/ImageModal";

import { API, graphqlOperation, Storage } from "aws-amplify";
import { AuthContext } from "../../context/AuthContext";

import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import {
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
  AntDesign
} from "@expo/vector-icons";

import { S3Image } from "../../components/CustomImage";
import { uploadImage, imagePicker } from "../../utility/imageUploader";

const limitOfImages = 3;

const getQuestionQuery = /* GraphQL */ `
  query GetQuestion($id: ID!) {
    getQuestion(id: $id) {
      id
      private
      closed
      userID
      user {
        id
        expoPushToken
        profileImageS3ObjectKey
        username
        introduction
        email
        phone
        question {
          nextToken
        }
        answer {
          nextToken
        }
        requestedQuestion {
          nextToken
        }
        createdAt
        updatedAt
      }
      title
      content
      requestedUserID
      chosenAnswerID
      images {
        items {
          id
          order
          questionID
          answerID
          S3ObjectKey
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const ModifyAnswerScreen = ({ navigation, route }) => {
  const [content, setContent] = useState("");

  const { user } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [questionObj, setQuestionObj] = useState(null);
  const [answerObj, setAnswerObj] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUris, setImageUris] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [deletedImages, setDeletedImages] = useState([]);
  const [answerUploaded, setAnswerUploaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    if (content !== "" || imageUris[0]) {
      if (answerUploaded) {
        setHasUnsavedChanges(false);
      } else if (content === initialContent) {
        setHasUnsavedChanges(false);
      } else {
        setHasUnsavedChanges(true);
      }
    } else {
      setHasUnsavedChanges(false);
    }
  }, [content, imageUris, answerUploaded, initialContent]);

  useEffect(() => {
    const unsubscribeBeforeRemove = navigation.addListener(
      "beforeRemove",
      (e) => {
        if (!hasUnsavedChanges || answerUploaded) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // if (answerUploaded) {
        //   navigation.dispatch(e.data.action);
        //   return;
        // }

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
  }, [navigation, hasUnsavedChanges, answerUploaded]);

  useEffect(() => {
    if (answerUploaded) {
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.pop();
      }, 3000);
    }
  }, [answerUploaded]);

  useEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "left",
      headerTitle: "답변하기"
    });
    getAnswer();
    getQuestion();
  }, []);

  const getAnswer = async () => {
    try {
      const answer = await API.graphql(
        graphqlOperation(queries.getAnswer, { id: route.params.answerID })
      );
      setContent(answer.data.getAnswer.content);
      setAnswerObj(answer.data.getAnswer);
      setImageUris(answer.data.getAnswer.images.items);
      setInitialContent(answer.data.getAnswer.content);
    } catch (err) {
      console.log(err);
    }
  };

  const getQuestion = async () => {
    try {
      const question = await API.graphql(
        graphqlOperation(getQuestionQuery, { id: route.params.questionID })
      );
      setQuestionObj(question.data.getQuestion);
    } catch (err) {
      console.log(err);
    }
  };

  const submitAnswer = async () => {
    //check for condition
    if (content.length < 10) {
      Alert.alert("내용은 10자 이상 입력해주세요.");
    } else {
      // mutation creating new question with given parameters
      Alert.alert(
        "답변을 수정하시겠습니까?",
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
                  graphqlOperation(mutations.updateAnswer, {
                    input: {
                      content: content,
                      id: answerObj.id
                      //Adjust for Korean timezone
                    }
                  })
                );

                await Promise.all(
                  deletedImages.map(async (imgObj) => {
                    await API.graphql(
                      graphqlOperation(mutations.deleteImage, {
                        input: { id: imgObj.id }
                      })
                    );
                  })
                );

                await Promise.all(
                  imageUris.map(async (imgObj, index) => {
                    if (imgObj.uri) {
                      await API.graphql(
                        graphqlOperation(mutations.createImage, {
                          input: {
                            order: index + 1,
                            answerID: answerObj.id,
                            S3ObjectKey: imgObj.S3ObjectKey
                          }
                        })
                      );
                    } else {
                      await API.graphql(
                        graphqlOperation(mutations.updateImage, {
                          input: { id: imgObj.id, order: index + 1 }
                        })
                      );
                    }
                  })
                );

                setAnswerUploaded(true);
                // navigation.push("Question", {
                //   isAnswersSubmittedNow: true,
                //   questionId: route.params.questionID
                // });
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

  const AnswerSubmitModal = () => (
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
            답변이
          </Text>
          <Text style={styles.modalText}>수정 되었습니다.</Text>
        </View>
      </View>
    </Modal>
  );

  const addImage = async () => {
    if (limitOfImages > imageUris.length) {
      if (!imageUploading) {
        let uri = await imagePicker();
        if (uri) {
          setImageUploading(true);
          const imageUriTemp = imageUris;
          setImageUris((prev) => [...prev, { uri: uri, state: "loading" }]);
          let key = await uploadImage(uri);
          if (key) {
            setImageUris([...imageUriTemp, { uri: uri, S3ObjectKey: key }]);
          }
          setImageUploading(false);
        }
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
            if (!imageUris[index].uri) {
              setDeletedImages((prev) => [...prev, imageUris[index]]);
              // await API.graphql(
              //   graphqlOperation(mutations.deleteImage, {
              //     input: { id: imageUris[index].id }
              //   })
              // );
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
    ]);
  };

  // const ImageModal = () => {
  //   const [imgIndex, setImgIndex] = useState(imageIndex);

  //   const renderThumbnailImage = ({ item, index }) => {
  //     return (
  //       <TouchableOpacity
  //         onPress={() => setImgIndex(index)}
  //         style={{ marginTop: 28 }}
  //       >
  //         {item.uri ? (
  //           <Image
  //             source={{ uri: item.uri }}
  //             style={{ height: 56, width: 56, marginRight: 6 }}
  //           />
  //         ) : (
  //           <S3Image
  //             imgKey={item.S3ObjectKey}
  //             style={{ height: 56, width: 56, marginRight: 6 }}
  //           />
  //         )}
  //       </TouchableOpacity>
  //     );
  //   };

  //   return imageUris.length > 0 ? (
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
  //           {imageUris[imgIndex].uri ? (
  //             <Image
  //               source={{ uri: imageUris[imgIndex].uri }}
  //               style={{ width: "100%", height: 400 }}
  //               resizeMode="contain"
  //             />
  //           ) : (
  //             <S3Image
  //               imgKey={imageUris[imgIndex].S3ObjectKey}
  //               style={{ width: "100%", height: 400 }}
  //               resizeMode="contain"
  //             />
  //           )}
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
  //   ) : null;
  // };
  const viewImage = (index) => {
    setImageIndex(index);
    if (!imageModalVisible) setImageModalVisible(true);
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
        ) : (
          <S3ImageBackground
            imgKey={item.S3ObjectKey}
            style={{
              width: 60,
              height: 60,
              marginLeft: 10,
              marginBottom: 10,
              alignItems: item.state == "flex-end"
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

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : null}
        enabled
        keyboardVerticalOffset={85}
        style={styles.container}
      >
        <SafeAreaView />
        <AnswerSubmitModal />
        <ImageModal
          imageIndex={imageIndex}
          hideImageModal={() => setImageModalVisible(false)}
          imageObjs={imageUris}
          imageModalVisible={imageModalVisible}
        />
        <View style={styles.container}>
          <ScrollView>
            {questionObj && (
              <View style={styles.questionContainer}>
                <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                  {questionObj.title}
                </Text>
                <Text style={{ fontSize: 12 }} numberOfLines={2}>
                  {questionObj.content}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <TextInput
                style={{ ...styles.answer, paddingBottom: 30, lineHeight: 24 }}
                placeholder="내용을 입력하세요."
                value={content}
                onChangeText={setContent}
                multiline={true}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </View>
        <View style={{ flexDirection: "row", marginTop: 30 }}>
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
          onPress={hasUnsavedChanges ? submitAnswer : null}
          style={{
            ...styles.submitButton,
            backgroundColor: hasUnsavedChanges ? "#FF6F4A" : "#C4C4C4"
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
              답변 수정하기
            </Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default ModifyAnswerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: "#EB4C2A",
    borderTopWidth: 1
  },
  answer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    height: 100,
    margin: 25,
    borderRadius: 10,
    padding: 20,
    justifyContent: "space-around"
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
  content: {
    width: 200,
    height: 400,
    borderColor: "#000",
    borderWidth: 1,
    justifyContent: "center",
    textAlign: "center"
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
