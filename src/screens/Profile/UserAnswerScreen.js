import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Text } from "../../components/CustomFontText";
import { S3Image } from "../../components/CustomImage";

import { API, graphqlOperation } from "aws-amplify";

import { fn_dateTimeToFormatted } from "../../utility/utilFunctions";

export const searchQuestions = /* GraphQL */ `
  query SearchQuestions(
    $filter: SearchableQuestionFilterInput
    $sort: SearchableQuestionSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchQuestions(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
          createdAt
          updatedAt
        }
        title
        content
        requestedUserID
        chosenAnswerID
        answer {
          nextToken
        }
        reaction {
          items {
            type
          }
          nextToken
        }
        images {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;

export const searchAnswers = /* GraphQL */ `
  query SearchAnswers(
    $filter: SearchableAnswerFilterInput
    $sort: SearchableAnswerSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchAnswers(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        user {
          id
          expoPushToken
          profileImageS3ObjectKey
          username
          introduction
          email
          phone
          createdAt
          updatedAt
        }
        chosen
        content
        questionID
        question {
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
            createdAt
            updatedAt
          }
          title
          content
          requestedUserID
          chosenAnswerID
          createdAt
          updatedAt
        }
        reaction {
          items {
            type
          }
          nextToken
        }
        images {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;

const UserAnswerScreen = ({ userID, navigation, selectedButton }) => {
  const [answers, setAnswers] = useState([]);

  const getAnswers = async () => {
    const result = await API.graphql(
      graphqlOperation(searchAnswers, {
        filter: {
          userID: { eq: userID }
        },
        sort: { field: "createdAt", direction: "desc" }
      })
    );
    setAnswers(result.data.searchAnswers.items);
  };

  useEffect(() => {
    const screenFocusUnsubscribe = navigation.addListener("focus", (e) => {
      getAnswers()
        .then(() => {})
        .catch((err) => console.log(err));
    });
    return () => screenFocusUnsubscribe();
  }, [navigation]);

  const renderAnswer = useCallback((answer) => {
    return (
      <React.Fragment key={answer.id}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() =>
            navigation.navigate("Question", { questionId: answer.questionID })
          }
        >
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 16,
              borderRadius: 5,
              borderColor: "rgba(0,0,0,0.15)",
              borderWidth: 1,
              marginBottom: 18
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 18
              }}
            >
              <S3Image
                imgKey={answer.question.user.profileImageS3ObjectKey}
                style={{ width: 28, height: 28, borderRadius: 14 }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: "600" }}>
                  {answer.question.user.username}
                </Text>
                <Text style={{ fontSize: 9, color: "#222B45", opacity: 0.5 }}>
                  {fn_dateTimeToFormatted(answer.question.createdAt)}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={2}
              style={{ fontWeight: "bold", fontSize: 14, marginBottom: 8 }}
            >
              {answer.question.title}
            </Text>
            <Text numberOfLines={2} style={{ fontSize: 14 }}>
              {answer.question.content}
            </Text>
          </View>

          <Text numberOfLines={3}>{answer.content}</Text>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../img/heart.png")}
                style={{ height: 20, width: 20, marginRight: 4 }}
              />
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                {
                  answer.reaction.items.filter((item) => item.type === "good")
                    .length
                }
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 8, backgroundColor: "#F2F2F2" }} />
      </React.Fragment>
    );
  }, []);

  useEffect(() => {
    getAnswers();
  }, []);

  return <View>{answers.map((answer) => renderAnswer(answer))}</View>;
};

export default UserAnswerScreen;

const styles = StyleSheet.create({
  questionContainer: {
    paddingHorizontal: 25,
    height: 350,
    paddingTop: 40,
    paddingBottom: 32
  }
});
