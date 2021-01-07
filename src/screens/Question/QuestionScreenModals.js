import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert
} from "react-native";

import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

export const ModifyModal = ({
  hideModal,
  setConfirmDeleteTrue,
  modifyModalVisible,
  isQuestionUser,
  modifyAnswerID,
  confirmDelete,
  navigation,
  questionID
}) => {
  const modifyQuestion = () => {
    hideModal();
    navigation.navigate("ModifyQuestion", { questionID: questionID });
  };

  const modifyAnswer = (id) => {
    hideModal();
    navigation.navigate("ModifyAnswer", {
      answerID: id,
      questionID: questionID
    });
  };

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
              hideModal();
              navigation.goBack();
            }
          }
        ]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const deleteAnswer = async () => {};

  return (
    <Modal transparent={true} animationType="fade" visible={modifyModalVisible}>
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={hideModal}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}>
          {confirmDelete === false && (
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
                      onPress={setConfirmDeleteTrue}
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
          {confirmDelete === true && (
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
};

export const ProfileModal = () => {
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
              <Text style={{ marginRight: 8 }}>{profile.numberOfAnswers}</Text>
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
  return <View></View>;
};

const styles = StyleSheet.create({
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
  deleteConfirmModal: {
    justifyContent: "space-evenly",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    height: 180,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 8
  }
});
