import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";

import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { QuestionContext } from "../context/QuestionContext";

import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import * as subscriptions from "../graphql/subscriptions";

const NewQuestion = ({ navigation, route }) => {
  const [questionContent, setQuestionContent] = useState("");
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);
  const { currentQuestion, setCurrentQuestionObj } = useContext(
    QuestionContext
  );

  const goBackAndClean = () => {
    navigation.goBack();
    setQuestionContent("");
  };

  const createQuestion = async () => {
    try {
      const result = await API.graphql(
        graphqlOperation(mutations.createQuestion, {
          input: currentQuestion
            ? {
                questionUserId: user.sub,
                content: questionContent,
                //Adjust for Korean timezone
                createdAt: Date.now() + 32400000,
                questionParentQuestionId: currentQuestion.id
              }
            : {
                questionUserId: user.sub,
                content: questionContent,
                //Adjust for Korean timezone
                createdAt: Date.now() + 32400000
              }
        })
      );

      setQuestionContent("");
      navigation.navigate("Home");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {}, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <AntDesign
          onPress={goBackAndClean}
          name="close"
          size={22}
          color="black"
          style={{ marginLeft: 10 }}
        />
      ),
      headerStyle: {
        shadowRadius: 0,
        shadowOffset: {
          height: 0
        }
      },
      headerTitleAlign: "left"
    });
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : null}
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <View style={styles.container}>
          <View style={styles.paddingContainer}>
            <View style={styles.container_1}>
              <View>
                <Text style={styles.hookText}>
                  {currentQuestion
                    ? "'" + currentQuestion.content + "'" + "에 대한 질문"
                    : "새로운 질문"}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    onChangeText={(text) => setQuestionContent(text)}
                    value={questionContent}
                    style={styles.questionText}
                    multiline={true}
                    placeholder={"질문을 입력해주세요."}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            alignSelf: "center",
            marginBottom: Dimensions.get("window").width / 80 + 12.5,
            marginLeft: 4
          }}
        >
          <TouchableOpacity
            onPress={createQuestion}
            style={{
              height: 40,
              width: 40,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <LinearGradient
              colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
              style={styles.gradientButton}
              start={[1, -0.5]}
              end={[-0.5, 1]}
            />
            <Entypo
              name="chevron-right"
              size={32}
              color="white"
              style={{ marginLeft: 1, marginTop: 2 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
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
  signOutButton: {
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    alignSelf: "stretch",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.65,

    elevation: 6
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    padding: 13,
    fontWeight: "bold"
  },

  gradientButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 20
  },
  container_1: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  questionText: {
    fontSize: 26,
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "center"
  },
  hookText: {
    paddingVertical: 20,
    fontSize: 28,
    fontWeight: "bold",
    color: "#EF194E"
  }
});

export default NewQuestion;
