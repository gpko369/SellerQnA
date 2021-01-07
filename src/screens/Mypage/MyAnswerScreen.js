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

const MyAnswerScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [myAnswerList, setMyAnswerList] = useState([]);

  // query loading question lists of userID matches current user's
  const getMyAnswerList = async () => {
    try {
      const answerListData = await API.graphql(
        graphqlOperation(queries.searchAnswers, {
          filter: { userID: { eq: user.sub } },
          sort: { field: "createdAt", direction: "desc" }
        })
      );
      let answers = [];
      answerListData.data.searchAnswers.items.map((answer) => {
        if (answer.question !== null) {
          answers.push(answer);
        }
      });
      setMyAnswerList(answers);
      // setMyAnswerList(answerListData.data.searchAnswers.items);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    //subscription on creation and deletion of answers
    getMyAnswerList();
    // const answerCreateSubscription = API.graphql(
    //   graphqlOperation(subscriptions.onCreateAnswer)
    // ).subscribe({
    //   next: () => getMyAnswerList()
    // });

    // const answerDeleteSubscription = API.graphql(
    //   graphqlOperation(subscriptions.onDeleteAnswer)
    // ).subscribe({ next: () => getMyAnswerList() });
    // return () => {
    //   answerDeleteSubscription.unsubscribe();
    //   answerCreateSubscription.unsubscribe();
    // };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getMyAnswerList();
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
      title={item.question.title}
      content={item.content}
      createdAt={item.createdAt}
      id={item.question.id}
    />
  );

  const Item = ({ title, content, id, createdAt }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Question", { questionId: id })}
        style={styles.item}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.answerDate}>
            {fn_dateTimeToFormatted(createdAt)}
          </Text>
        </View>
        <Text style={styles.content} numberOfLines={3}>
          {content}
        </Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={myAnswerList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </View>
  );
};

export default MyAnswerScreen;

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
    marginBottom: 8,
    flex: 7
  },
  answerDate: {
    fontSize: 10,
    flex: 1,
    textAlign: "right"
  },
  content: {
    fontSize: 14
  },
  searchIcon: {
    marginRight: 20
  }
});
