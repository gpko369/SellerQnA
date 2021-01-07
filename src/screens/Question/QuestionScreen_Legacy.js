import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef
} from "react";
import {
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  FlatList,
  SafeAreaView,
  Animated
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";
import { S3Image } from "../../components/CustomImage";
import ImageModal from "../../components/ImageModal";

import { AuthContext } from "../../context/AuthContext";

import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import { fn_dateTimeToFormatted } from "../../utility/utilFunctions";
import { getUserProfile } from "../../utility/userProfileGetter";
import {
  AntDesign,
  MaterialCommunityIcons,
  Entypo,
  Ionicons
} from "@expo/vector-icons";

import { QuestionBanner } from "../../banner/MainBanners";
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
      answer {
        items {
          id
          userID
          content
          questionID
          createdAt
          updatedAt
          chosen
          images {
            items {
              order
              S3ObjectKey
              id
            }
            nextToken
          }
        }
        nextToken
      }
      images(sortDirection: ASC) {
        items {
          id
          S3ObjectKey
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const QuestionScreen = ({ navigation, route }) => {
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [questionID, setQuestionID] = useState(
    route.params?.questionId ? route.params.questionId : ""
  );
  const [questionObj, setQuestionObj] = useState({});
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userObj, setUserObj] = useState(null);
  const [confirmtDelete, setConfirmDelete] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTextInput, setReportTextInput] = useState(false);
  const [isQuestionUser, setIsQuestionUser] = useState(false);
  const [answerLoaded, setAnswerLoaded] = useState(false);
  const [imageObjs, setImageObjs] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileModalUserID, setProfileModalUserID] = useState(null);
  const [answerImages, setAnswerImages] = useState([]);
  const [chosenAnswerImages, setChosenAnswerImages] = useState([]);
  const [imageModalMode, setImageModalMode] = useState(null);
  const [answerImageModalIndex, setAnswerImageModalIndex] = useState(0);
  const [modifyAnswerID, setModifyAnswerID] = useState(null);

  const { user } = useContext(AuthContext);

  // query getting question with given id
  const getQuestion = async () => {
    try {
      const question = await API.graphql(
        graphqlOperation(getQuestionQuery, { id: questionID })
      ).catch((err) => console.log(err));
      setImageObjs(question.data.getQuestion.images.items);
      if (question.data.getQuestion.userID === user.sub)
        setIsQuestionUser(true);
      setQuestionObj(question.data.getQuestion);
      let answerImgs = [];
      question.data.getQuestion.answer.items.forEach((item) => {
        if (item.chosen !== true) {
          answerImgs.push(item.images.items);
        }
      });
      setAnswerImages(answerImgs);
      const answerObj = await Promise.all(
        question.data.getQuestion.answer.items.map(async (item) => {
          const obj = await getUserProfile(item.userID);
          if (
            question.data.getQuestion.closed === true &&
            item.id === question.data.getQuestion.chosenAnswerID
          ) {
            setChosenAnswer({ ...obj, ...item });
            setChosenAnswerImages(item.images.items);
            return { ...obj, ...item };
          } else return { ...obj, ...item };
        })
      );
      setAnswers(answerObj);
      setAnswerLoaded(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      setUserObj(user);
    }
  }, [user]);

  useEffect(() => {
    if (route.params.questionId) {
      getQuestion()
        .then(() => setLoading(false))
        .catch((err) => console.log(err));
    }
    const unsubscribeFocus = navigation.addListener("focus", (e) => {
      getQuestion()
        .then(() => setLoading(false))
        .catch((err) => console.log(err));
    });
    return unsubscribeFocus;
  }, [navigation]);

  useEffect(() => {
    if (questionObj?.user) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{ flexDirection: "row", marginLeft: -20 }}>
            <TouchableOpacity
              onPress={() => {
                setProfileModalVisible(true);
                setProfileModalUserID(questionObj.user.id);
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <S3Image
                  imgKey={questionObj.user.profileImageS3ObjectKey}
                  style={{
                    height: 36,
                    width: 36,
                    marginRight: 12,
                    borderRadius: 18
                  }}
                />

                <View style={{ justifyContent: "center" }}>
                  <Text style={{ fontWeight: "600" }}>
                    {questionObj.user.username}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#353535" }}>
                    {fn_dateTimeToFormatted(questionObj.createdAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ),
        headerRight: () => {
          if (questionObj.userID === user.sub && !chosenAnswer)
            return (
              <TouchableOpacity
                onPress={onPressQuestionThreeDots}
                style={{ marginRight: 30 }}
              >
                <Entypo name="dots-three-horizontal" size={24} color="black" />
              </TouchableOpacity>
            );
        }
      });
    }
  }, [questionObj, chosenAnswer]);

  const deleteQuestion = async () => {
    if (questionObj.answer.items[0]) {
      Alert.alert(
        "이미 답변이 달린 질문은 삭제가 불가능합니다. 자세한 사항은 관리자에게 문의해주세요."
      );
    } else {
      try {
        const question = await API.graphql(
          graphqlOperation(mutations.deleteQuestion, {
            input: { id: questionID }
          })
        );
        Alert.alert("삭제되었습니다.", "", [
          {
            text: "확인",
            onPress: () => {
              setModifyModalVisible(false);
              navigation.goBack();
            }
          }
        ]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const deleteAnswer = async () => {
    try {
      const answer = await API.graphql(
        graphqlOperation(mutations.deleteAnswer, {
          input: { id: questionObj.answer.items[0].id }
        })
      );
      Alert.alert("삭제되었습니다.", "", [
        { text: "확인", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const modifyQuestion = () => {
    setModifyModalVisible(false);
    setConfirmDelete(false);
    navigation.navigate("ModifyQuestion", { questionID: questionObj.id });
  };

  const modifyAnswer = (id) => {
    setModifyModalVisible(false);
    setConfirmDelete(false);
    navigation.navigate("ModifyAnswer", {
      answerID: id,
      questionID: questionObj.id
    });
  };

  const ModifyModal = () => (
    <Modal transparent={true} animationType="fade" visible={modifyModalVisible}>
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => {
          setModifyModalVisible(false);
          setConfirmDelete(false);
        }}
      >
        <View style={styles.modalWrapper}>
          {confirmtDelete === false && (
            <>
              <View style={{ flex: 1 }} />
              <View
                style={{
                  ...styles.modal,
                  alignItems: "stretch",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  height: isQuestionUser ? 180 : 90,
                  paddingBottom: 20
                }}
              >
                {isQuestionUser && (
                  <>
                    <TouchableOpacity
                      onPress={() => setConfirmDelete(true)}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <Text style={{ fontWeight: "bold", color: "#D01B02" }}>
                        {isQuestionUser ? "질문" : "답변"} 삭제
                      </Text>
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={24}
                        color="#D01B02"
                      />
                    </TouchableOpacity>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#F3F3F3"
                      }}
                    />
                  </>
                )}
                <TouchableOpacity
                  onPress={
                    isQuestionUser
                      ? modifyQuestion
                      : () => modifyAnswer(modifyAnswerID)
                  }
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {isQuestionUser ? "질문" : "답변"} 수정
                  </Text>
                  <AntDesign name="edit" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </>
          )}
          {confirmtDelete === true && (
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
              <View style={{ flex: 1 }} />
              <View style={styles.deleteConfirmModal}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#353535" }}>
                      {isQuestionUser ? "질문" : "답변"}을 삭제하게되면 해당
                      {isQuestionUser ? "질문" : "답변"}은 찾을 수 없습니다.
                    </Text>
                    <Text style={{ fontSize: 12, color: "#353535" }}>
                      해당 {isQuestionUser ? "질문" : "답변"}을 변경하시려면
                      삭제 대신 {isQuestionUser ? "질문" : "답변"} 수정을
                      해주세요.
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
                <View
                  style={{ borderBottomWidth: 1, borderBottomColor: "#F3F3F3" }}
                />
                {isQuestionUser && (
                  <>
                    <TouchableOpacity
                      onPress={isQuestionUser ? deleteQuestion : deleteAnswer}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Text style={{ fontWeight: "bold", color: "#D01B02" }}>
                        {isQuestionUser ? "질문" : "답변"} 삭제
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#F3F3F3"
                      }}
                    />
                  </>
                )}
                <TouchableOpacity
                  onPress={isQuestionUser ? modifyQuestion : modifyAnswer}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {isQuestionUser ? "질문" : "답변"} 수정
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setConfirmDelete(false)}
                style={{
                  borderWidth: 2,
                  borderBottomWidth: 0,
                  borderColor: "rgba(0,0,0,0.2)",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 25,
                  backgroundColor: "white",
                  height: 52,
                  justifyContent: "center",
                  borderBottomWidth: 2,
                  borderRadius: 10,
                  marginBottom: 32
                }}
              >
                <Text style={{ fontWeight: "bold" }}>취소</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
  const ReportModal = () => {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={reportModalVisible}
      >
        <TouchableWithoutFeedback
          style={{ flex: 1 }}
          onPress={() => {
            setReportModalVisible(false);
            setReportTextInput(false);
            Keyboard.dismiss();
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : null}
            enabled
            style={{ flex: 1 }}
          >
            <View style={styles.modalWrapper}>
              {reportTextInput === false && (
                <>
                  <View style={{ flex: 1 }} />
                  <View
                    style={{
                      ...styles.modal,
                      paddingBottom: 20
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setReportTextInput(true)}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <Text style={{ fontWeight: "bold", color: "#D01B02" }}>
                        신고하기
                      </Text>
                      <Ionicons
                        name="ios-notifications-outline"
                        size={24}
                        color="#D01B02"
                      />
                    </TouchableOpacity>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#F3F3F3"
                      }}
                    />
                  </View>
                </>
              )}
              {reportTextInput === true && (
                <>
                  <View style={{ flex: 1 }} />
                  <View
                    style={{
                      ...styles.modal,
                      flexDirection: "column",
                      alignItems: "stretch",
                      justifyContent: "space-around",
                      height: 340
                    }}
                  >
                    <TouchableWithoutFeedback>
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            어떤 문제가 있으신가요?
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setReportModalVisible(false);
                              setReportTextInput(false);
                            }}
                          >
                            <AntDesign name="close" size={24} color="black" />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={{ height: 280 }}>
                          <TextInput />
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const ImageModal = () => {
    const [imgIndex, setImgIndex] = useState(imageIndex);

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
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={imageModalVisible}
      >
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
              style={{ alignSelf: "flex-end", paddingBottom: 20 }}
              onPress={() => setImageModalVisible(false)}
            >
              <AntDesign name="close" size={20} color="black" />
            </TouchableOpacity>
            <S3Image
              imgKey={
                imageModalMode === "question"
                  ? imageObjs[imgIndex]?.S3ObjectKey
                  : imageModalMode === "answer"
                  ? answerImages[answerImageModalIndex][imgIndex]?.S3ObjectKey
                  : imageModalMode === "chosenAnswer"
                  ? chosenAnswerImages[imgIndex]?.S3ObjectKey
                  : null
              }
              style={{ width: "100%", height: 400 }}
              resizeMode="contain"
            />
            <View>
              <FlatList
                data={
                  imageModalMode === "question"
                    ? imageObjs
                    : imageModalMode === "answer"
                    ? answerImages[answerImageModalIndex]
                    : imageModalMode === "chosenAnswer"
                    ? chosenAnswerImages
                    : null
                }
                renderItem={renderThumbnailImage}
                keyExtractor={(item) => item.id + "abc"}
                scrollEnabled={false}
                horizontal={true}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const ProfileModal = () => {
    const [profile, setProfile] = useState({});
    useEffect(() => {
      getProfile();
    }, [profileModalUserID]);

    const getProfile = async () => {
      const result = await getUserProfile(profileModalUserID);
      setProfile(result);
    };

    if (profile.userImage) {
      return (
        <Modal
          transparent={true}
          animationType="fade"
          visible={profileModalVisible}
        >
          <View
            style={{
              justifyContent: "flex-end",
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)"
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                height: 276,
                marginHorizontal: 10,
                borderRadius: 22,
                padding: 25,
                marginBottom: 52
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <S3Image
                  imgKey={profile.userImage}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    marginBottom: 18
                  }}
                />
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <AntDesign name="close" size={20} color="black" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                {profile.userName}
              </Text>
              <Text>{profile.introduction}</Text>
              <View style={{ flexDirection: "row", marginTop: 20 }}>
                <Image
                  source={require("../../img/profileNumberImage.png")}
                  style={{ width: 18, height: 18, marginRight: 8 }}
                />
                <Text style={{ fontWeight: "bold", marginRight: 8 }}>질문</Text>
                <Text style={{ marginRight: 8 }}>
                  {profile.numberOfQuestions}
                </Text>
                <Text style={{ fontWeight: "bold", marginRight: 8 }}>답변</Text>
                <Text style={{ marginRight: 8 }}>
                  {profile.numberOfAnswers}
                </Text>
                <Text style={{ fontWeight: "bold", marginRight: 8 }}>채택</Text>
                <Text style={{ marginRight: 8 }}>
                  {profile.numberOfChosenAnswers}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      return null;
    }
  };

  const onPressQuestionThreeDots = () => {
    if (user.sub === questionObj.userID) setModifyModalVisible(true);
    else setReportModalVisible(true);
  };

  const onPressAnswerThreeDots = (answerUserId, answerID) => {
    if (user.sub === answerUserId) {
      setModifyModalVisible(true);
      setModifyAnswerID(answerID);
    } else setReportModalVisible(true);
  };

  const viewImage = (index) => {
    setImageIndex(index);
    if (!imageModalVisible) setImageModalVisible(true);
  };

  const chooseAnswer = (answerID) => {
    Alert.alert(
      "해당 답변 채택 시 다른 답변을 채택하실 수 없으며, 추가적으로 답변이 달릴 수 없습니다.",
      "",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            await API.graphql(
              graphqlOperation(mutations.updateQuestion, {
                input: {
                  id: questionID,
                  closed: true,
                  chosenAnswerID: answerID
                }
              })
            );
            setTimeout(() => {
              getQuestion();
            }, 1000);
          }
        }
      ]
    );
  };

  const renderImage = useCallback(({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          viewImage(index);
        }}
        style={{ marginTop: 28 }}
      >
        <S3Image
          imgKey={item.S3ObjectKey}
          style={{ height: 56, width: 56, marginRight: 6 }}
        />
      </TouchableOpacity>
    );
  }, []);

  const renderQuestionImage = useCallback(({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setImageModalMode("question");
          viewImage(index);
        }}
        style={{ marginTop: 28 }}
      >
        <S3Image
          imgKey={item.S3ObjectKey}
          style={{ height: 56, width: 56, marginRight: 6 }}
        />
      </TouchableOpacity>
    );
  }, []);

  const renderAnswerImage = useCallback(
    ({ item, index, answerIndex, chosen }) => {
      return (
        <TouchableOpacity
          onPress={() => {
            setImageModalMode(chosen ? "chosenAnswer" : "answer");
            viewImage(index);
            setAnswerImageModalIndex(answerIndex);
          }}
          style={{ marginTop: 28 }}
        >
          <S3Image
            imgKey={item.S3ObjectKey}
            style={{ height: 56, width: 56, marginRight: 6 }}
          />
        </TouchableOpacity>
      );
    },
    []
  );

  const AnswerItem = useCallback(
    ({ item, chosen, answerIndex }) => {
      const fadeAnim = useRef(new Animated.Value(0.4)).current; // Initial value for opacity: 0

      useEffect(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      }, [fadeAnim]);

      return (
        <Animated.View key={{ ...item.id, opacity: fadeAnim }}>
          {chosen ? (
            <View style={{ height: 8, backgroundColor: "#FFA14A" }} />
          ) : null}
          <View
            style={{
              paddingHorizontal: 25,
              paddingTop: 24,
              paddingBottom: 24
            }}
          >
            {chosen ? (
              <View style={{ marginBottom: 20, flexDirection: "row" }}>
                <Image
                  source={require("../../img/chosenAnswerFlag.png")}
                  style={{ width: 16.5, height: 25.2, marginRight: 13.5 }}
                />
                <Text style={{ color: "#FFA14A", fontSize: 14 }}>
                  질문자가 채택한 답변입니다.
                </Text>
              </View>
            ) : null}
            <View style={styles.profile}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setProfileModalVisible(true);
                    setProfileModalUserID(item.userID);
                  }}
                  style={{ flexDirection: "row" }}
                >
                  <S3Image
                    imgKey={item.userImage}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginRight: 9
                    }}
                  />
                  <View style={{ justifyContent: "center" }}>
                    <Text style={{ fontWeight: "600" }}>{item.userName}</Text>
                    <Text style={{ fontSize: 10, color: "#353535" }}>
                      {fn_dateTimeToFormatted(item.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {item.userID === user.sub && !chosenAnswer && (
                  <TouchableOpacity
                    onPress={() => onPressAnswerThreeDots(item.userID, item.id)}
                  >
                    <Entypo
                      name="dots-three-horizontal"
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={{ lineHeight: 24 }}>{item.content}</Text>
            <FlatList
              data={item.images.items}
              renderItem={({ item, index }) =>
                renderAnswerImage({ item, index, answerIndex, chosen })
              }
              keyExtractor={(item) => item.S3ObjectKey}
              scrollEnabled={false}
              horizontal={true}
            />
          </View>
          {isQuestionUser ? (
            !chosenAnswer ? (
              <View style={{ marginBottom: 16, marginHorizontal: 25 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#F2F2F2"
                  }}
                />
                <View
                  style={{
                    marginTop: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Text style={{ color: "#353535", opacity: 0.5 }}>
                    이 답변이 마음에 드셨나요?
                  </Text>
                  <TouchableOpacity
                    onPress={() => chooseAnswer(item.id)}
                    style={{
                      backgroundColor: "#FF6F4A",
                      borderRadius: 5,
                      paddingHorizontal: 22,
                      paddingVertical: 12
                    }}
                  >
                    <Text style={{ color: "white" }}>채택하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : chosen ? (
              <View style={{ marginBottom: 16, marginHorizontal: 25 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#F2F2F2"
                  }}
                />
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      marginTop: 28,
                      marginBottom: 12,
                      color: "#FF6F4A"
                    }}
                  >
                    채택되었습니다.
                  </Text>
                </View>
              </View>
            ) : null
          ) : null}
          <View style={{ backgroundColor: "#F2F2F2", height: 8 }} />
        </Animated.View>
      );
    },
    [isQuestionUser, chosenAnswer]
  );

  return loading ? (
    <View style={{ flex: 1, backgroundColor: "white" }}></View>
  ) : questionObj ? (
    <View style={{ flex: 1 }}>
      <SafeAreaView />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <ModifyModal />
        <ReportModal />
        <ImageModal
          imageIndex={imageIndex}
          hideImageModal={() => setImageModalVisible(false)}
          imageObjs={
            imageModalMode === "question"
              ? imageObjs
              : imageModalMode === "answer"
              ? answerImages[answerImageModalIndex]
              : imageModalMode === "chosenAnswer"
              ? chosenAnswerImages
              : null
          }
          imageModalVisible={imageModalVisible}
        />
        <ProfileModal />
        <View style={styles.questionContainer}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 18
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {questionObj.title}
              </Text>
            </View>
            <View style={{ justifyContent: "center" }}></View>
          </View>
          <Text style={{ fontSize: 16, lineHeight: 24 }}>
            {questionObj.content}
          </Text>
          <FlatList
            data={imageObjs}
            renderItem={renderQuestionImage}
            keyExtractor={(item) => {
              return item.id;
            }}
            scrollEnabled={false}
            horizontal={true}
          />
        </View>
        <QuestionBanner />
        <View style={{ backgroundColor: "#F2F2F2", height: 8 }} />
        <View style={styles.answerContainer}>
          {chosenAnswer && <AnswerItem item={chosenAnswer} chosen={true} />}
          {answers.map((item, index) => {
            return item.id && item.chosen !== true ? (
              <AnswerItem item={item} answerIndex={index} key={item.id} />
            ) : null;
          })}
          {answers.length === 0 && (
            <View
              style={{
                alignItems: "center",
                flex: 1
              }}
            >
              <Text
                style={{ fontSize: 24, fontWeight: "bold", marginTop: 100 }}
              >
                답변을 기다리는 중입니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {userObj?.sub !== questionObj.userID && (
        <TouchableOpacity
          activeOpacity={chosenAnswer ? 1 : 0.2}
          onPress={() => {
            if (!chosenAnswer) {
              navigation.navigate("NewAnswer", {
                questionID: questionObj.id
              });
            }
          }}
          style={{
            ...styles.submitButton,
            backgroundColor: chosenAnswer ? "#C4C4C4" : "#FF6F4A"
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
              {chosenAnswer ? "질문이 마감되었습니다." : "답변하기"}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  ) : null;
};

export default QuestionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  questionContainer: {
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 32
  },
  profile: {
    marginBottom: 20
  },
  answerContainer: {
    flex: 1
  },
  answerButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: "#353535",
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
  arrowBox: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6F4B",
    borderRadius: 5
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  deleteConfirmModal: {
    justifyContent: "space-evenly",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    height: 180,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 8
  },
  submitButton: {
    backgroundColor: "#FF6F4A",
    height: 76,
    justifyContent: "center",
    alignItems: "center"
  }
});
