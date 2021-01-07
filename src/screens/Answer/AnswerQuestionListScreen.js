import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef
} from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";
import LottieView from "lottie-react-native";
import { S3Image } from "../../components/CustomImage";

import { API, graphqlOperation } from "aws-amplify";
import { AuthContext } from "../../context/AuthContext";
import * as queries from "../../graphql/queries";
import * as subscriptions from "../../graphql/subscriptions";

import { fn_dateTimeToFormatted } from "../../utility/utilFunctions";

const AnswerQusetionListScreen = ({ navigation }) => {
  const [questionList, setQuestionList] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState(null);
  const loadingRef = useRef(null);

  // query loading question list in descending order (timestamp)
  const getQuestionList = async () => {
    if (nextToken !== null || questionList.length === 0) {
      try {
        setLoading(true);
        const questionListData = await API.graphql(
          graphqlOperation(queries.searchQuestions, {
            filter: {
              private: { ne: true },
              chosenAnswerID: { exists: false },
              userID: { ne: user.sub }
            },
            sort: { field: "createdAt", direction: "desc" },
            limit: 12,
            nextToken: nextToken
          })
        );
        setNextToken(questionListData.data.searchQuestions.nextToken);
        setQuestionList((prev) => [
          ...prev,
          ...questionListData.data.searchQuestions.items
        ]);
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  // reload question list when screen focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getQuestionList();
    });

    const unsubscribeScreenFocus = navigation.addListener("blur", () => {
      setTimeout(() => {
        setQuestionList([]);
        setLoading(true);
        setNextToken(null);
      }, 300);
    });
    return () => {
      unsubscribe;
      unsubscribeScreenFocus;
    };
  }, [navigation]);

  // useEffect(() => {
  //   getQuestionList();
  //   // subscription on creation and deletion of question
  //   const questionCreateSubscription = API.graphql(
  //     graphqlOperation(subscriptions.onCreateQuestion)
  //   ).subscribe({
  //     next: () => getQuestionList()
  //   });
  //   const questionDeleteSubscription = API.graphql(
  //     graphqlOperation(subscriptions.onDeleteQuestion)
  //   ).subscribe({ next: () => getQuestionList() });
  //   return () => {
  //     questionDeleteSubscription.unsubscribe();
  //     questionCreateSubscription.unsubscribe();
  //   };
  // }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <Item
        title={item.title}
        content={item.content}
        createdAt={item.createdAt}
        id={item.id}
        imageKey={item.user.profileImageS3ObjectKey}
      />
    ),
    []
  );

  const renderNewItems = () => {
    getQuestionList();
  };

  const Item = ({ title, content, id, createdAt, imageKey }) => {
    const fadeAnim = useRef(new Animated.Value(0.4)).current; // Initial value for opacity: 0

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }).start();
    }, [fadeAnim]);
    return (
      <Animated.View style={{ ...styles.itemContainer, opacity: fadeAnim }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Question", { questionId: id });
          }}
          style={styles.item}
        >
          <View style={{ flexDirection: "row" }}>
            <S3Image
              imgKey={imageKey}
              style={{
                height: 52,
                width: 52,
                marginRight: 16,
                borderRadius: 26
              }}
            />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={styles.questionDate}>
                  {fn_dateTimeToFormatted(createdAt)}
                </Text>
              </View>
              <Text style={styles.content} numberOfLines={3}>
                {content}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{
              zIndex: 10,
              position: "absolute",
              bottom: -40,
              alignSelf: "center"
            }}
          >
            <LottieView
              source={require("../../img/dotloading.json")}
              style={{ width: 100, height: 100 }}
              ref={loadingRef}
              autoPlay={true}
            />
          </View>
        ) : null}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            marginHorizontal: 25,
            marginVertical: 40
          }}
        >
          답변
        </Text>
        {questionList.length > 0 && (
          <FlatList
            data={questionList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={renderNewItems}
            onEndReachedThreshold={0}
          />
        )}
        {questionList.length === 0 && (
          <>
            {loading ? null : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  답변을 기다리는 질문이 없습니다.
                </Text>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

export default AnswerQusetionListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  inBoxContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    borderRadius: 5,
    backgroundColor: "#353535",
    marginBottom: 20
  },
  button: {
    backgroundColor: "#FF6F4A",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5
  },
  itemContainer: {
    borderBottomColor: "#f3f3f3",
    borderBottomWidth: 1,
    paddingHorizontal: 25
  },
  item: {
    backgroundColor: "#fff",
    paddingVertical: 20
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    flex: 9
  },
  questionDate: {
    flex: 2,
    fontSize: 10,
    textAlign: "right"
  },
  content: {
    fontSize: 14,
    opacity: 0.6
  }
});
