import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  SafeAreaView
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../../graphql/queries";

import TextInputHeader from "../Header/TextInputHeader";

import { FontAwesome } from "@expo/vector-icons";

const DATA = [
  { id: "1", title: "질문" },
  { id: "2", title: "기이이이이이이이이이이인 질문" },
  {
    id: "3",
    title:
      "엄청나게 기이이이이이이이이이이잉이이이이이잉이이이이이이이이이이ㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㄴ 질문"
  }
];
const SearchResultScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState(route.params?.prevSearchText);
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const getSearchResult = async () => {
    if (searchText.length >= 2) {
      setSearchLoading(true);
      try {
        const result = await API.graphql(
          graphqlOperation(queries.searchQuestions, {
            filter: { title: { wildcard: "*" + searchText + "*" } },
            limit: 12
          })
        );
        setSearchResult(result.data.searchQuestions.items);
      } catch (err) {
        console.log(err);
      }
    } else {
      setSearchResult([]);
    }
  };

  const renderList = ({ item }) => (
    <ResultList id={item.id} title={item.title} />
  );
  const ResultList = ({ title, id }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Question", { questionId: id })}
    >
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  var timer;

  useEffect(() => {
    clearTimeout(timer);
    setSearchLoading(true);
    timer = setTimeout(getSearchResult, 300);
  }, [searchText]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : null}
        enabled
        style={{ flex: 1 }}
        keyboardVerticalOffset={35}
      >
        <SafeAreaView />
        <View style={{ flex: 1 }}>
          <TextInputHeader
            inputText={searchText}
            setInputText={setSearchText}
            isSearch={false}
            onSearch={() =>
              navigation.push("SearchResult", { prevSearchText: searchText })
            }
            goBack={() => navigation.pop()}
          />

          <View style={styles.container}>
            {searchResult.length === 0 && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={styles.noResultText}>
                    검색된 질문이 없습니다
                  </Text>
                  <Text style={{ textDecorationLine: "underline" }}>
                    '{searchText}'
                  </Text>
                  <Text style={{ marginBottom: 24 }}>
                    에 대한 내용으로 질문하시겠어요?
                  </Text>

                  <TouchableOpacity
                    style={styles.questionButton}
                    onPress={() =>
                      navigation.navigate("NewQuestion", {
                        prevSearchText: searchText
                      })
                    }
                  >
                    <View style={styles.questionBox}>
                      <FontAwesome name="question" size={24} color="#FF6F4A" />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        marginHorizontal: 28
                      }}
                    >
                      질문하기
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {searchResult.length > 0 && (
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <FlatList
                    data={searchResult}
                    renderItem={renderList}
                    keyExtractor={(item) => item.id}
                  />
                </View>
                <View>
                  <View style={styles.modal}>
                    <View>
                      <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
                        질문하기
                      </Text>
                      <Text>
                        '{searchText.slice(0, 10)}
                        {searchText.length > 10 ? "..." : null}'으로
                        질문하시겠어요?
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.arrowBox}
                      onPress={() =>
                        navigation.navigate("NewQuestion", {
                          prevSearchText: searchText
                        })
                      }
                    >
                      <FontAwesome name="arrow-right" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default SearchResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: "#EB4C2A",
    borderTopWidth: 1
  },
  searchSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EB4C2A",
    alignItems: "center"
  },
  backIcon: {
    marginLeft: 20
  },
  searchIcon: {
    marginRight: 20
  },
  questionButton: {
    backgroundColor: "#FF6F4A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 5
  },
  questionBox: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 5
  },
  resultBox: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3"
  },
  resultText: {
    marginHorizontal: 20,
    fontSize: 14
  },
  noResultText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16
  },
  modal: {
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "rgba(0,0,0,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 96,
    paddingHorizontal: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  arrowBox: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6F4B",
    borderRadius: 5
  }
});
