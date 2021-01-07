import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../graphql/mutations";

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const Answer = ({ navigation, route }) => {
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [questionId, setQuestionId] = useState("");

  const findCurrentUser = async () => {
    await Auth.currentAuthenticatedUser()
      .then((user) => {
        setUserId(user.attributes.sub);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (route.params && route.params.questionId) {
      setQuestionId(route.params.questionId);
    }
    findCurrentUser();
  }, []);

  const createAnswer = async () => {
    try {
      await API.graphql(
        graphqlOperation(mutations.createAnswer, {
          input: {
            userId: userId,
            content: content,
            answerQuestionId: questionId
          }
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const onPressCreateAnswerButton = async () => {
    await createAnswer();
    Alert.alert(
      "답변이 생성되었습니다.",
      "",
      [{ text: "OK", onPress: () => navigation.navigate("Home") }],
      { cancelable: false }
    );
  };

  const onChangeContent = (text) => {
    setContent(text);
  };

  if (route.params.questionId) {
    return (
      <DismissKeyboard>
        <View style={styles.container}>
          <View style={styles.paddingContainer}>
            {/* <LinearGradient
              colors={["#3c5b65", "#3d4c78"]}
              style={styles.gradient}
              start={[1, -0.5]}
              end={[-0.5, 1]}
            /> */}
            <View style={styles.container_8}>
              <View style={styles.textContainer}>
                <TextInput
                  style={styles.textInputContent}
                  onChangeText={onChangeContent}
                  placeholder="답변을 입력해주세요"
                  multiline={true}
                  value={content}
                />
              </View>
            </View>
            <View style={styles.container_1}>
              <TouchableOpacity
                onPress={onPressCreateAnswerButton}
                style={styles.button}
              >
                <LinearGradient
                  colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
                  style={styles.gradientButton}
                  start={[1, -0.5]}
                  end={[-0.5, 1]}
                />
                <Text style={styles.buttonText}>답변하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </DismissKeyboard>
    );
  } else {
    navigation.goBack();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center"
  },
  paddingContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    alignItems: "stretch"
  },
  button: {
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    alignSelf: "stretch"
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    padding: 17
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%"
  },
  gradientButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 25
  },
  container_8: {
    flex: 8
  },
  container_1: {
    flex: 1
  },
  textContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    color: "rgb(53,53,53)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5
  },
  textInputTitle: {
    height: 50,
    borderColor: "rgb(198,198,198)",
    borderBottomWidth: 0.5,
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(53,53,53)"
  },
  textInputContent: {
    height: "100%",
    marginTop: 8,
    color: "rgb(53,53,53)"
  }
});

export default Answer;
