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

const UserQuestionScreen = ({ userID, navigation, selectedButton }) => {
  const [questions, setQuestions] = useState([]);

  const getQuestions = async () => {
    const result = await API.graphql(
      graphqlOperation(searchQuestions, {
        filter: {
          userID: { eq: userID }
        },
        sort: { field: "createdAt", direction: "desc" }
      })
    );
    setQuestions(result.data.searchQuestions.items);
  };

  useEffect(() => {
    const screenFocusUnsubscribe = navigation.addListener("focus", (e) => {
      getQuestions()
        .then(() => {})
        .catch((err) => console.log(err));
    });
    return () => screenFocusUnsubscribe();
  }, [navigation]);

  const renderQuestion = useCallback((question) => {
    return (
      <React.Fragment key={question.id}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() =>
            navigation.navigate("Question", { questionId: question.id })
          }
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18
            }}
          >
            <S3Image
              imgKey={question.user.profileImageS3ObjectKey}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "600" }}>
                {question.user.username}
              </Text>
              <Text style={{ fontSize: 10, color: "#222B45", opacity: 0.5 }}>
                {fn_dateTimeToFormatted(question.createdAt)}
              </Text>
            </View>
          </View>
          <Text
            numberOfLines={2}
            style={{ fontWeight: "bold", marginBottom: 18 }}
          >
            {question.title}
          </Text>
          <Text numberOfLines={3}>{question.content}</Text>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../img/heart.png")}
                style={{ height: 20, width: 20, marginRight: 4 }}
              />
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                {
                  question.reaction.items.filter((item) => item.type === "good")
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
    getQuestions();
  }, []);

  return <View>{questions.map((question) => renderQuestion(question))}</View>;
};

export default UserQuestionScreen;

const styles = StyleSheet.create({
  questionContainer: {
    paddingHorizontal: 25,
    height: 280,
    paddingTop: 40,
    paddingBottom: 32
  }
});
