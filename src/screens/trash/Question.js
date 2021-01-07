import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";
import { AuthContext } from "../context/AuthContext";
import { QuestionContext } from "../context/QuestionContext";

import { fn_dateTimeToFormatted } from "../utility/utilFunctions";

import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

import * as queries from "../graphql/queries";

const getQuestion1 = /* GraphQL */ `
  query GetQuestion($id: ID!) {
    getQuestion(id: $id) {
      id
      user {
        id
        username
        email
        phone
        question {
          nextToken
        }
        idea {
          nextToken
        }
        board {
          nextToken
        }
        createdAt
        updatedAt
      }
      content
      parentQuestion {
        id
        user {
          id
          username
          email
          phone
          createdAt
          updatedAt
        }
        content
        parentQuestion {
          id
          content
          createdAt
          updatedAt
        }
        childQuestion {
          nextToken
        }
        board {
          id
          title
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      childQuestion {
        items {
          id
          user {
            id
            username
            email
            phone
          }
          content
          createdAt
          updatedAt
          childQuestion {
            items {
              id
              content
              createdAt
            }
          }
        }
        nextToken
      }
      board {
        id
        user {
          id
          username
          email
          phone
          createdAt
          updatedAt
        }
        title
        question {
          nextToken
        }
        idea {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

const Question = ({ navigation, route }) => {
  const [question, setQuestion] = useState("");
  const { currentQuestion, setCurrentQuestionObj } = useContext(
    QuestionContext
  );

  useEffect(() => {
    getQuestion();
  }, []);

  const getQuestion = async () => {
    try {
      const data = await API.graphql(
        graphqlOperation(getQuestion1, { id: route.params.questionId })
      );
      setQuestion(data.data.getQuestion);
      //Add question object to Context
      setCurrentQuestionObj(data.data.getQuestion);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    navigation.addListener("focus", () => {
      getQuestion();
    });
  }, [navigation]);

  const questionComponent = ({ item }) => (
    <View
      style={{
        backgroundColor: "#F6F6F6",
        padding: 20,
        paddingTop: 40,
        paddingLeft: 50,
        marginVertical: 5,
        marginLeft: 15,
        borderRadius: 5
      }}
    >
      {item.user.username == "gongja" ? (
        <Image
          source={require("../img/google.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            position: "absolute",
            marginTop: 20,
            marginLeft: -25
          }}
        />
      ) : item.user.username == "홍" ? (
        <Image
          source={require("../img/facebook.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            position: "absolute",
            marginTop: 20,
            marginLeft: -25
          }}
        />
      ) : (
        <Image
          source={require("../img/sampleProfile.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            position: "absolute",
            marginTop: 20,
            marginLeft: -25
          }}
        />
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>{item.user.username}</Text>
        <Entypo
          name="dots-three-horizontal"
          size={20}
          color="black"
          style={{ marginTop: -5 }}
        />
      </View>

      <Text
        style={{
          color: "black",
          fontWeight: "bold",
          fontSize: 15,
          paddingTop: 20,
          paddingBottom: 15
        }}
      >
        {item.content}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {fn_dateTimeToFormatted(item.createdAt)}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 15
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ justifyContent: "center" }}>
            <Feather name="git-merge" size={13} color="black" />
          </View>
          <View style={{ justifyContent: "center" }}>
            <Text style={{ fontSize: 12, marginLeft: 3 }}>
              {item.childQuestion.items.length}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
          onPress={() => navigation.push("Question", { questionId: item.id })}
        >
          <LinearGradient
            colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
            style={styles.gradientNotice}
            start={[1, -0.5]}
            end={[-0.5, 1]}
          />
          <Feather name="chevron-right" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {question ? (
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: "#F6F6F6",
              padding: 20,
              paddingTop: 40,
              paddingLeft: 75,
              paddingBottom: 40,
              borderRadius: 5
            }}
          >
            {question.user.username == "gongja" ? (
              <Image
                source={require("../img/google.png")}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: "contain",
                  position: "absolute",
                  marginTop: 20,
                  marginLeft: 10
                }}
              />
            ) : question.user.username == "홍" ? (
              <Image
                source={require("../img/facebook.png")}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: "contain",
                  position: "absolute",
                  marginTop: 20,
                  marginLeft: 10
                }}
              />
            ) : (
              <Image
                source={require("../img/sampleProfile.png")}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: "contain",
                  position: "absolute",
                  marginTop: 20,
                  marginLeft: 10
                }}
              />
            )}
            <Text>{question.user.username}</Text>
            <Text
              style={{
                color: "black",
                fontWeight: "bold",
                fontSize: 15,
                paddingTop: 20,
                paddingBottom: 15
              }}
            >
              {question.content}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {fn_dateTimeToFormatted(question.createdAt)}
            </Text>
          </View>
          {question.parentQuestion ? (
            <TouchableOpacity
              onPress={() =>
                navigation.push("Question", {
                  questionId: question.parentQuestion.id
                })
              }
              style={{
                height: 44,
                marginHorizontal: 20,
                justifyContent: "center",
                paddingHorizontal: 20,
                marginTop: 15,
                marginBottom: 10
              }}
            >
              <LinearGradient
                colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
                style={styles.gradientNotice}
                start={[1, -0.5]}
                end={[-0.5, 1]}
              />
              <Text
                style={{ fontWeight: "bold", fontSize: 13, color: "white" }}
              >
                이 질문은 어디서 왔을까요?
              </Text>
            </TouchableOpacity>
          ) : null}
          {question.childQuestion.items[0] ? (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  justifyContent: "center",
                  paddingRight: 25,
                  paddingLeft: 20,
                  alignItems: "stretch",
                  overflow: "hidden"
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 35,
                    paddingTop: 25
                  }}
                >
                  <Octicons
                    name="primitive-dot"
                    size={20}
                    style={{ position: "absolute", top: 23, marginLeft: -4 }}
                    color="rgb(216,216,216)"
                  />
                  <Text>또 다른 질문들이 생겼어요</Text>
                </View>
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderLeftColor: "rgb(216,216,216)",
                    height: 20,
                    marginTop: -10
                  }}
                />
              </View>
              <View style={styles.paddingContainer}>
                <FlatList
                  style={{
                    borderLeftWidth: 1,
                    borderLeftColor: "rgb(216,216,216)",
                    overflow: "visible"
                  }}
                  data={question.childQuestion.items}
                  renderItem={questionComponent}
                  keyExtractor={(item) => item.id}
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: 20,
                alignItems: "center",
                paddingVertical: 60
              }}
            >
              <Image
                source={require("../img/anyquestion.png")}
                style={{
                  width: 90,
                  height: 90,
                  resizeMode: "contain"
                }}
              />
              <View
                style={{
                  paddingVertical: 60,
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  질문의 질을 한 층 높여주기 위한
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  첫 질문을 올려주세요.
                </Text>
              </View>
              <FontAwesome
                name="chevron-down"
                size={40}
                color="rgb(216,216,216)"
              />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  paddingContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 25,
    paddingLeft: 20,
    alignItems: "stretch",
    marginBottom: 80,
    overflow: "hidden"
  },
  gradientNotice: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 7
  }
});

export default Question;
