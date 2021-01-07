import React, { useContext, useEffect, useState } from "react";
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

import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";
import { AuthContext } from "../context/AuthContext";

import * as queries from "../graphql/queries";

const QuestionView = ({ navigation, route }) => {
  const [question, setQuestion] = useState("");
  const { isAuthenticated, checkAuth, setUserObj } = useContext(AuthContext);

  useEffect(() => {
    if (route.params && route.params.questionId) {
      getQuestion(route.params.questionId);
    }
  }, []);

  const getQuestion = async (questionId) => {
    try {
      const questionObj = await API.graphql(
        graphqlOperation(queries.getQuestion, { id: questionId })
      );
      setQuestion(questionObj.data.getQuestion);
    } catch (err) {
      console.log(err);
    }
  };

  if (route.params.questionId) {
    if (question) {
      return (
        <View style={styles.container}>
          <View style={styles.paddingContainer}>
            {/* <LinearGradient
              colors={["#3c5b65", "#3d4c78"]}
              style={styles.gradient}
              start={[1, -0.5]}
              end={[-0.5, 1]}
            /> */}
            <View style={styles.container_8}>
              <View style={styles.questionContainer}>
                <View style={styles.questionTitleContainer}>
                  <Text style={styles.questionTitleText}>질문</Text>
                </View>
                <View>
                  <Text>{question.content}</Text>
                </View>
              </View>
              <View style={styles.answerContainer}>
                <View style={styles.answerTitleContainer}>
                  <Text style={styles.answerTitleText}>답변</Text>
                </View>
                <View>
                  {!question.answer.items[0] ? (
                    <Text>아직 답변이 없습니다</Text>
                  ) : (
                    question.answer.items.map((answer, i) => {
                      return <Text key={i}>{answer.content}</Text>;
                    })
                  )}
                </View>
              </View>
            </View>
            <View style={styles.container_1}></View>
          </View>
        </View>
      );
    } else {
      return null;
    }
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
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%"
  },

  container_8: {
    flex: 8,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20
  },
  container_1: {
    flex: 1
  },
  questionContainer: {
    flex: 1
  },
  questionTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(53,53,53)",
    paddingBottom: 8
  },
  questionTitleText: {
    fontWeight: "bold",
    fontSize: 20
  },
  answerContainer: {
    flex: 1
  },
  answerTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(53,53,53)",
    paddingBottom: 8
  },
  answerTitleText: {
    fontWeight: "bold",
    fontSize: 20
  }
});

export default QuestionView;
