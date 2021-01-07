import React, { useEffect, useContext, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Feather } from "@expo/vector-icons";

import { AuthContext } from "../../context/AuthContext";
import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../../graphql/queries";
import * as subscriptions from "../../graphql/subscriptions";

import { fn_dateTimeToFormatted } from "../../utility/utilFunctions";

const customSearchQuestions = /* GraphQL */ `
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
        userID
        user {
          id
          username
          email
          phone
          createdAt
          updatedAt
        }
        title
        content
        requestedUserID
        answer {
          nextToken
          items {
            content
            chosen
          }
        }
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;

const MyQuestionScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [myQuestionList, setMyQuestionList] = useState([]);

  // query loading question lists of userID matches current user's
  const getMyQuestionList = async () => {
    try {
      const questionListData = await API.graphql(
        graphqlOperation(customSearchQuestions, {
          filter: { userID: { eq: user.sub } },
          sort: { field: "createdAt", direction: "desc" }
        })
      );
      setMyQuestionList(questionListData.data.searchQuestions.items);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    //subscription on creation and deletion of questions
    getMyQuestionList();
    // const questionCreateSubscription = API.graphql(
    //   graphqlOperation(subscriptions.onCreateQuestion)
    // ).subscribe({
    //   next: () => getMyQuestionList()
    // });

    // const questionDeleteSubscription = API.graphql(
    //   graphqlOperation(subscriptions.onDeleteQuestion)
    // ).subscribe({ next: () => getMyQuestionList() });
    // return () => {
    //   questionDeleteSubscription.unsubscribe();
    //   questionCreateSubscription.unsubscribe();
    // };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getMyQuestionList();
    });
    return () => {
      unsubscribe;
    };
  }, [navigation]);

  const onSearch = () => {};

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onSearch}>
          <Feather
            style={styles.searchIcon}
            name="search"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      )
    });
  }, []);
  const renderItem = ({ item }) => (
    <Item
      title={item.title}
      content={item.content}
      createdAt={item.createdAt}
      id={item.id}
      answer={item.answer}
    />
  );

  const Item = ({ title, content, id, createdAt, answer }) => {
    let didChoose = false;
    answer.items.forEach((answer) => {
      if (answer.chosen === true) didChoose = true;
    });

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Question", { questionId: id })}
          style={styles.item}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.questionDate}>
              {fn_dateTimeToFormatted(createdAt)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              justifyContent: "space-between"
            }}
          >
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text
              style={{
                borderRadius: 2,
                paddingHorizontal: 4,
                paddingVertical: 3,
                fontSize: 10,
                fontWeight: answer.items.length > 0 ? "bold" : "normal",
                color:
                  answer.items.length > 0
                    ? didChoose
                      ? "#31C836"
                      : "#FF6F4A"
                    : "#000",
                opacity: answer.items.length > 0 ? 1 : 0.3,
                flex: 2,
                textAlign: "right"
              }}
            >
              {answer.items.length > 0
                ? didChoose
                  ? "체택완료"
                  : `답변 ${answer.items.length}개`
                : "답변대기중"}
            </Text>
          </View>
          <Text style={styles.content} numberOfLines={3}>
            {content}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={myQuestionList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </View>
  );
};

export default MyQuestionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#fff"
  },
  itemContainer: {
    borderBottomColor: "#f3f3f3",
    borderBottomWidth: 1
  },
  item: {
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    marginVertical: 20
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 9
  },
  questionDate: {
    fontSize: 10
  },
  content: {
    fontSize: 14
  },
  searchIcon: {
    marginRight: 20
  }
});
