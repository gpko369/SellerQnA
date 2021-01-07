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
import { AntDesign, Entypo } from "@expo/vector-icons";

import { QuestionBanner } from "../../banner/MainBanners";
import { ModifyModal } from "./QuestionScreenModals";

const getQuestionQuery = /* GraphQL */ `
  query GetQuestion($id: ID!) {
    getQuestion(id: $id) {
      id
      private
      closed
      userID
      user {
        id
        profileImageS3ObjectKey
        username
        email
        phone
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
          reaction {
            items {
              id
              userID
              answerID
              type
            }
          }
        }
        nextToken
      }
      reaction {
        items {
          id
          userID
          questionID
          type
          createdAt
          updatedAt
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
  const [questionObj, setQuestionObj] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isQuestionUser, setIsQuestionUser] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(null);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [modalImageObjs, setModalImageObjs] = useState([]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileModalUserID, setProfileModalUserID] = useState(null);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [modifyAnswerID, setModifyAnswerID] = useState(null); //tells which answer id to modify or delete to modal
  const [reactionLoading, setReactionLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const getQuestion = async () => {
    try {
      const question = await API.graphql(
        graphqlOperation(getQuestionQuery, { id: route.params.questionId })
      );
      if (question.data.getQuestion.userID === user.sub)
        setIsQuestionUser(true);
      const answerObjs = await Promise.all(
        question.data.getQuestion.answer.items.map(async (item) => {
          const obj = await getUserProfile(item.userID);
          if (item.id === question.data.getQuestion.chosenAnswerID) {
            setChosenAnswer({
              ...obj,
              ...item
            });
            return { ...obj, ...item };
          } else return { ...obj, ...item };
        })
      );
      question.data.getQuestion.answer.items = answerObjs;
      const userGoodReaction = question.data.getQuestion.reaction.items.filter(
        (reaction) => reaction.userID === user.sub
      );
      setQuestionObj(question.data.getQuestion);
    } catch (err) {
      console.log(err);
    }
  };

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
                navigation.navigate("Profile", {
                  userID: questionObj.userID
                });
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
  const onPressQuestionThreeDots = () => {
    if (user.sub === questionObj.userID) setModifyModalVisible(true);
    else setReportModalVisible(true);
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
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center"
                }}
              >
                <Image
                  source={require("../../img/profileNumberImage.png")}
                  style={{ width: 18, height: 18, marginRight: 8 }}
                />
                <Text style={{ fontWeight: "bold", marginRight: 8 }}>질문</Text>
                <Text style={{ marginRight: 8, marginBottom: 3 }}>
                  {profile.numberOfQuestions}
                </Text>
                <Text style={{ fontWeight: "bold", marginRight: 8 }}>답변</Text>
                <Text style={{ marginRight: 8, marginBottom: 3 }}>
                  {profile.numberOfAnswers}
                </Text>
                <Text style={{ fontWeight: "bold", marginRight: 8 }}>채택</Text>
                <Text style={{ marginRight: 8, marginBottom: 3 }}>
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

  const AnswerItem = useCallback(
    ({ answer, chosen, questionObj }) => {
      const [helpedReactionNumber, setHelpedReactionNubmer] = useState(
        answer.reaction.items.length
      );
      const [isHelped, setIsHelped] = useState(
        answer.reaction.items.filter((item) => item.userID === user.sub)
          .length > 0
          ? true
          : false
      );
      const [reactionID, setReactionID] = useState(
        answer.reaction.items.filter((item) => item.userID === user.sub)
          .length > 0
          ? answer.reaction.items.filter((item) => item.userID === user.sub)[0]
              .id
          : null
      );
      const [helpedReactionLoading, setHelpedReactionLoading] = useState(false);
      const fadeAnim = useRef(new Animated.Value(0.4)).current; // Initial value for opacity: 0

      useEffect(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      }, [fadeAnim]);

      const chooseAnswer = () => {
        Alert.alert(
          "해당 답변 채택 시 다른 답변을 채택하실 수 없으며, 추가적으로 답변이 달릴 수 없습니다.",
          "",
          [
            { text: "취소", style: "cancel" },
            {
              text: "확인",
              onPress: async () => {
                try {
                  console.log(questionObj.id);
                  const result = await API.graphql(
                    graphqlOperation(mutations.updateQuestion, {
                      input: {
                        id: questionObj.id,
                        chosenAnswerID: answer.id
                      }
                    })
                  );

                  let prevQuestionObj = questionObj;
                  prevQuestionObj.chosenAnswrID = answer.id;
                  prevQuestionObj.answer.items = prevQuestionObj.answer.items.map(
                    (item) => {
                      if (item.id === answer.id) item.chosen = true;
                      setChosenAnswer(item);
                      return item;
                    }
                  );
                  setQuestionObj(prevQuestionObj);
                } catch (err) {
                  console.log(err);
                }
              }
            }
          ]
        );
      };

      useEffect(() => {
        if (helpedReactionLoading) {
          helpedAnswerHandler();
        }
      }, [helpedReactionLoading]);

      const helpedAnswerHandler = async () => {
        if (isHelped) {
          const result = await API.graphql(
            graphqlOperation(mutations.deleteReactionAnswer, {
              input: { id: reactionID }
            })
          );
          setIsHelped(false);
          setHelpedReactionNubmer((prev) => prev - 1);
        } else {
          const result = await API.graphql(
            graphqlOperation(mutations.createReactionAnswer, {
              input: {
                answerID: answer.id,
                type: "helped",
                userID: user.sub
              }
            })
          );
          setReactionID(result.data.createReactionAnswer.id);
          setIsHelped(true);
          setHelpedReactionNubmer((prev) => prev + 1);
        }
        setHelpedReactionLoading(false);
      };

      const onPressAnswerThreeDots = () => {
        if (user.sub === answer.userID) {
          setModifyModalVisible(true);
          setModifyAnswerID(answer.id);
        } else setReportModalVisible(true);
      };

      return (
        <Animated.View key={{ ...answer.id, opacity: fadeAnim }}>
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
                <Text style={{ color: "#FFA14A" }}>
                  질문자가 채택한 답변입니다.
                </Text>
              </View>
            ) : null}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Profile", {
                      userID: answer.userID
                    });
                  }}
                  style={{ flexDirection: "row" }}
                >
                  <S3Image
                    imgKey={answer.userImage}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginRight: 9
                    }}
                  />
                  <View style={{ justifyContent: "center" }}>
                    <Text style={{ fontWeight: "600" }}>{answer.userName}</Text>
                    <Text style={{ fontSize: 10, color: "#353535" }}>
                      {fn_dateTimeToFormatted(answer.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {answer.userID === user.sub && !chosenAnswer && (
                  <TouchableOpacity
                    onPress={() =>
                      onPressAnswerThreeDots(answer.userID, answer.id)
                    }
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
            <Text style={{ lineHeight: 24 }}>{answer.content}</Text>
            <FlatList
              data={answer.images.items}
              renderItem={({ item, index }) =>
                renderImage({ item, index, images: answer.images.items })
              }
              keyExtractor={(item) => item.S3ObjectKey}
              scrollEnabled={false}
              horizontal={true}
            />
            <View style={{ flexDirection: "row", marginTop: 31 }}>
              <Image
                source={require("../../img/fire.png")}
                style={{ height: 20, width: 20, marginRight: 4 }}
              />
              <Text style={{ fontWeight: "bold" }}>{helpedReactionNumber}</Text>
            </View>
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
                    onPress={() => chooseAnswer(answer.id)}
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
          <View style={{ height: 74, paddingHorizontal: 25 }}>
            <View style={{ borderWidth: 1, borderColor: "#F2F2F2" }} />
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setHelpedReactionLoading(true);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Image
                    source={
                      isHelped
                        ? require("../../img/fire.png")
                        : require("../../img/emptyFire.png")
                    }
                    style={{ height: 24, width: 24, marginRight: 8 }}
                  />
                  <Text
                    style={{
                      opacity: isHelped ? 1 : 0.6,
                      fontWeight: "bold"
                    }}
                  >
                    도움되었어요
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ backgroundColor: "#F2F2F2", height: 8 }} />
        </Animated.View>
      );
    },
    [isQuestionUser, chosenAnswer]
  );

  const QuestionItem = useCallback(() => {
    const [goodReactionNumber, setGoodReactionNumber] = useState(
      questionObj.reaction.items.filter((item) => item.type === "good").length
    );
    const [isGood, setIsGood] = useState(
      questionObj.reaction.items.filter(
        (item) => item.userID === user.sub && item.type === "good"
      ).length
        ? true
        : false
    ); //boolean wheather user already pressed good reaction to question or not
    const [goodReactionLoading, setGoodReactionLoading] = useState(false);

    const [reactionID, setReactionID] = useState(
      questionObj.reaction.items.filter((item) => item.userID === user.sub)
        .length > 0
        ? questionObj.reaction.items.filter(
            (item) => item.userID === user.sub
          )[0].id
        : null
    );

    useEffect(() => {
      if (goodReactionLoading) {
        goodQuestionHandler();
      }
    }, [goodReactionLoading]);

    const goodQuestionHandler = async () => {
      if (isGood) {
        const result = await API.graphql(
          graphqlOperation(mutations.deleteReactionQuestion, {
            input: { id: reactionID }
          })
        );
        setIsGood(false);
        setGoodReactionNumber((prev) => prev - 1);
      } else {
        const result = await API.graphql(
          graphqlOperation(mutations.createReactionQuestion, {
            input: {
              questionID: questionObj.id,
              type: "good",
              userID: user.sub
            }
          })
        );
        setReactionID(result.data.createReactionQuestion.id);
        setIsGood(true);
        setGoodReactionNumber((prev) => prev + 1);
      }
      setGoodReactionLoading(false);
    };

    return (
      <>
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
            data={questionObj.images.items}
            renderItem={({ item, index }) =>
              renderImage({ item, index, images: questionObj.images.items })
            }
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            horizontal={true}
          />
          <View style={{ flexDirection: "row", marginTop: 31 }}>
            <Image
              source={require("../../img/heart.png")}
              style={{ height: 20, width: 20, marginRight: 4 }}
            />
            <Text style={{ fontWeight: "bold" }}>{goodReactionNumber}</Text>
          </View>
        </View>
        <View style={{ height: 74, paddingHorizontal: 25 }}>
          <View style={{ borderWidth: 1, borderColor: "#F2F2F2" }} />
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <TouchableOpacity onPress={() => setGoodReactionLoading(true)}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  source={
                    isGood
                      ? require("../../img/heart.png")
                      : require("../../img/emptyHeart.png")
                  }
                  style={{ height: 24, width: 24, marginRight: 8 }}
                />
                <Text
                  style={{
                    opacity: isGood ? 1 : 0.6,
                    fontWeight: "bold"
                  }}
                >
                  좋은 질문이예요
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }, [questionObj]);

  const renderImage = ({ item, index, images }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setModalImageObjs(images);
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
  };

  const viewImage = (index) => {
    setImageIndex(index);
    if (!imageModalVisible) setImageModalVisible(true);
  };

  return loading ? (
    <View style={{ flex: 1, backgroundColor: "white" }}></View>
  ) : questionObj ? (
    <View style={{ flex: 1 }}>
      <SafeAreaView />
      <ScrollView style={styles.container}>
        <ModifyModal
          hideModal={() => {
            setModifyModalVisible(false);
            setConfirmDelete(false);
          }}
          setConfirmDeleteTrue={() => setConfirmDelete(true)}
          modifyModalVisible={modifyModalVisible}
          isQuestionUser={isQuestionUser}
          confirmDelete={confirmDelete}
          modifyAnswerID={modifyAnswerID}
          navigation={navigation}
          questionID={questionObj.id}
        />
        <ImageModal
          imageIndex={imageIndex}
          hideImageModal={() => setImageModalVisible(false)}
          imageObjs={modalImageObjs}
          imageModalVisible={imageModalVisible}
        />
        <ProfileModal />
        <QuestionItem />
        <QuestionBanner />
        <View style={{ backgroundColor: "#F2F2F2", height: 8 }} />
        <View style={styles.answerContainer}>
          {chosenAnswer && (
            <AnswerItem
              answer={chosenAnswer}
              chosen={true}
              questionObj={questionObj}
            />
          )}
          {questionObj.answer.items.map((item, index) => {
            return item.id && item.chosen !== true ? (
              <AnswerItem
                answer={item}
                key={item.id}
                questionObj={questionObj}
              />
            ) : null;
          })}
          {questionObj.answer.items.length === 0 && (
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
      {user.sub !== questionObj.userID && (
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
  submitButton: {
    backgroundColor: "#FF6F4A",
    height: 76,
    justifyContent: "center",
    alignItems: "center"
  }
});
