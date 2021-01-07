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
  TouchableOpacity,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
  Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Text, TextInput } from "../../components/CustomFontText";
import * as Permissions from "expo-permissions";

import { API, graphqlOperation } from "aws-amplify";

import * as queries from "../../graphql/queries";

import { getUserProfile } from "../../utility/userProfileGetter";

import { AuthContext } from "../../context/AuthContext";
import { fn_dateTimeToFormatted } from "../../utility/utilFunctions";
import { S3Image } from "../../components/CustomImage";
import { HomeBanners } from "../../banner/MainBanners";
import { AntDesign } from "@expo/vector-icons";

const searchQuestions = /* GraphQL */ `
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

const QuestionHomeScreen = ({ navigation }) => {
  const safeAreaTopPadding = useSafeAreaInsets().top;
  const { user } = useContext(AuthContext);
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState(null);

  const loadingRef = useRef(null);

  const getQuestionList = async () => {
    if (nextToken !== null || questionList.length === 0) {
      try {
        setLoading(true);
        const questionListData = await API.graphql(
          graphqlOperation(searchQuestions, {
            filter: {
              private: { ne: true },
              closed: { eq: true }
            },
            sort: { field: "createdAt", direction: "desc" },
            limit: 6,
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

  const getNotificationPermission = async () => {
    //디바이스의 현재 알림 허용 상태를 요청
    const { permissions } = await Permissions.askAsync(
      Permissions.NOTIFICATIONS
    );
  };

  useEffect(() => {
    getNotificationPermission();
  }, []);

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

  useEffect(() => {
    getUserProfile(user.sub); //for expo token
  }, []);

  // useEffect(() => {
  //   if (isSearching) {
  //     navigation.setOptions({ tabBarVisible: false });
  //   } else {
  //     navigation.setOptions({ tabBarVisible: true });
  //   }
  // }, [isSearching]);

  const renderItem = useCallback(
    ({ item }) => (
      <Item
        title={item.title}
        content={item.content}
        createdAt={item.createdAt}
        id={item.id}
        userName={item.user.username}
        imageKey={item.user.profileImageS3ObjectKey}
        reaction={item.reaction}
      />
    ),
    []
  );

  const renderNewItems = () => {
    getQuestionList();
  };

  const Item = ({
    title,
    content,
    id,
    createdAt,
    userName,
    imageKey,
    reaction
  }) => {
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
          style={{ flex: 1 }}
        >
          <View
            style={{
              flexDirection: "row",
              marginBottom: 20
            }}
          >
            <S3Image
              imgKey={imageKey}
              style={{
                height: 36,
                width: 36,
                marginRight: 12,
                borderRadius: 18
              }}
            />
            <View style={{ justifyContent: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>
                {userName}
              </Text>
              <Text style={{ fontSize: 10, opacity: 0.5 }}>
                {fn_dateTimeToFormatted(createdAt)}
              </Text>
            </View>
          </View>
          <Text
            style={{ fontWeight: "bold", marginBottom: 16, fontSize: 15 }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text style={{ fontSize: 15, opacity: 0.6 }} numberOfLines={3}>
            {content}
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end"
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../img/heart.png")}
                style={{ height: 20, width: 20, marginRight: 4 }}
              />
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                {reaction.items.filter((item) => item.type === "good").length}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const Search = () => {
    const [searchingText, setSearchingText] = useState("");
    const [searchedItems, setSearchedItems] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [noResult, setNoResult] = useState(false);
    const timeoutRef = useRef();
    const textInputRef = useRef();

    const fadeAnim = useRef(new Animated.Value(0.4)).current;
    const fadeAnimSearchSheet = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
      if (!searchLoading) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        }).start();
      }
    }, [fadeAnim, searchLoading]);

    useEffect(() => {
      if (isSearching) {
        Animated.timing(fadeAnimSearchSheet, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      }
    }, [fadeAnimSearchSheet, isSearching]);

    useEffect(() => {
      if (!isSearching) {
        setSearchingText("");
        setSearchedItems([]);
        textInputRef.current.blur();
      }
    }, [isSearching]);

    const search = async () => {
      // delay 시간 만큼 지나기 전 검색어 변경 시 기존 mutation 실행 중단
      clearTimeout(timeoutRef.current);
      setSearchLoading(true);
      // 검색어 입력 시 일정 시간의 delay 부여
      timeoutRef.current = setTimeout(async () => {
        const result = await API.graphql(
          graphqlOperation(queries.searchQuestions, {
            filter: { title: { wildcard: "*" + searchingText + "*" } },
            sort: { field: "createdAt", direction: "desc" }
          })
        );
        setSearchedItems(
          result.data.searchQuestions.items.map((item) => {
            return { title: item.title, questionId: item.id };
          })
        );
        if (!result.data.searchQuestions.items[0]) {
          setNoResult(true);
        } else {
          setNoResult(false);
        }
        setSearchLoading(false);
        // 500ms 의 delay (500ms 은 임의의 값이라 변경 가능)
      }, 600);
    };

    useEffect(() => {
      if (searchingText) {
        search();
      } else {
        // 검색어가 없을 시 loading 중인 mutation 실행을 중단, 및 loading 상태를 false 로 변경
        clearTimeout(timeoutRef.current);
        setSearchLoading(false);
        setSearchedItems([]);
      }
    }, [searchingText]);

    const closeSearch = () => {
      Animated.timing(fadeAnimSearchSheet, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true
      }).start();
      setTimeout(() => setIsSearching(false), 80);
    };

    const renderItem = ({ item, key }) => {
      return (
        <TouchableOpacity
          key={key}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#F3F3F3",
            height: 64,
            paddingHorizontal: 25,
            justifyContent: "center"
          }}
          onPress={() => {
            navigation.navigate("Question", { questionId: item.questionId });
          }}
        >
          <Text numberOfLines={2}>
            {item.title.slice(0, item.title.indexOf(searchingText))}
            <Text style={{ color: "#EB4C2A" }}>{searchingText}</Text>
            {item.title.slice(
              item.title.indexOf(searchingText) + searchingText.length
            )}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 25,
            borderBottomColor: "#ff6f4a",
            borderBottomWidth: 1,
            justifyContent: "space-between"
          }}
        >
          <TextInput
            style={{ height: 50, flex: 1 }}
            ref={textInputRef}
            placeholder="궁금한 질문을 검색해보세요"
            onFocus={() => setIsSearching(true)}
            value={searchingText}
            onChangeText={(text) => {
              setSearchingText(text);
              setNoResult(false);
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={{ marginLeft: 12 }}>
              <AntDesign name="search1" size={20} color="black" />
            </TouchableOpacity>
            {isSearching && (
              <TouchableOpacity
                style={{ marginLeft: 12 }}
                onPress={closeSearch}
              >
                <Text>취소</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {isSearching && (
          <Animated.View
            style={{
              position: "absolute",
              flex: 1,
              top: safeAreaTopPadding + 51,
              width: "100%",
              zIndex: 100,
              height: "100%",
              backgroundColor: "white",
              opacity: fadeAnimSearchSheet
            }}
          >
            {searchLoading ? (
              // 검색 결과 로딩 시 보여줄 컴포넌트, 현재 임시로 넣어둠 (필수 X)
              <View
                style={{
                  paddingVertical: 160,
                  alignSelf: "center",
                  justifyContent: "center"
                }}
              >
                <LottieView
                  source={require("../../img/dotloading.json")}
                  style={{ width: 100, height: 100 }}
                  ref={loadingRef}
                  autoPlay={true}
                />
              </View>
            ) : searchingText && noResult ? (
              // 검색결과 없을 시 로드할 컴포넌트(임시)
              <View
                style={{
                  paddingHorizontal: 25,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 160
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    textAlign: "center",
                    fontWeight: "bold"
                  }}
                >
                  "{searchingText}"에 대한 검색결과가 없습니다.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#FF6F4A",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 5,
                    marginTop: 24
                  }}
                  onPress={() => navigation.navigate("NewQuestion")}
                >
                  <Text style={{ color: "white", fontSize: 14 }}>
                    새로운 질문하기
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  style={{ flex: 1, marginBottom: 90 }}
                >
                  {searchedItems.map((item) =>
                    renderItem({ item: item, key: item.id })
                  )}
                </ScrollView>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </>
    );
  };

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <Search />
      <>
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

        <View style={styles.paddingContainer}>
          <FlatList
            ListHeaderComponent={<HomeBanners />}
            data={questionList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={renderNewItems}
            onEndReachedThreshold={0}
          />
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  paddingContainer: {
    marginBottom: 90
  },
  banner: {
    height: 112,
    marginBottom: 24
  },
  itemContainer: {
    height: 265,
    borderBottomColor: "#F2F2F2",
    borderBottomWidth: 8,
    borderRadius: 4,
    padding: 24
  }
});

export default QuestionHomeScreen;
