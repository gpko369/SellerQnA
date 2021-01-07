import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
  Keyboard,
  Platform,
  SafeAreaView
} from "react-native";
import { Text, TextInput } from "../components/CustomFontText";

import Animated from "react-native-reanimated";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  createStackNavigator,
  CardStyleInterpolators
} from "@react-navigation/stack";
import { NavigationContainer, DrawerActions } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import QuestionHomeScreen from "../screens/Question/QuestionHomeScreen";
import NewQuestionScreen from "../screens/Question/NewQuestionScreen";
import AnswerQuestionListScreen from "../screens/Answer/AnswerQuestionListScreen";
import NewAnswerScreen from "../screens/Answer/NewAnswerScreen";
import MyQuestionScreen from "../screens/Mypage/MyQuestionScreen";
import MyAnswerScreen from "../screens/Mypage/MyAnswerScreen";
import SearchResultScreen from "../screens/Question/SearchResultScreen";
import SettingScreen from "../screens/Mypage/SettingScreen";
import QuestionScreen from "../screens/Question/QuestionScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import ProfileModalScreen from "../screens/Profile/ProfileModalScreen";
import NoticeListScreen from "../screens/Notice/NoticeListScreen";
import NoticeScreen from "../screens/Notice/NoticeScreen";
import FAQScreen from "../screens/Notice/FAQScreen";
import ModifyQuestionScreen from "../screens/Question/ModifyQuestionScreen";
import ModifyAnswerScreen from "../screens/Answer/ModifyAnswerScreen";
import ProfileEditScreen from "../screens/Mypage/ProfileEditScreen";
import AlertScreen from "../screens/Mypage/AlertScreen";

import DrawerContent from "./DrawerContent";

import { Entypo, AntDesign, Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";

import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";

const BottomTab = createBottomTabNavigator();

const MyTabBar = ({ state, descriptors, navigation, position }) => {
  return (
    <View>
      <View style={{ backgroundColor: "white", paddingVertical: 8 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#ffffff",
            padding: 10,
            marginBottom: -10,
            alignSelf: "center",
            ...(Platform.OS === "ios"
              ? {
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84
                }
              : { elevation: 5 })
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;
            const icon =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.icon !== undefined
                ? options.icon
                : null;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
              Keyboard.dismiss();
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key
              });
              Keyboard.dismiss();
            };

            const inputRange = state.routes.map((_, i) => i);
            const opacity = Animated.interpolate(position, {
              inputRange,
              outputRange: inputRange.map((i) => (i === index ? 1 : 0))
            });

            return (
              <React.Fragment key={route.key}>
                {index === 2 && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("NewQuestion")}
                  >
                    <View
                      style={{
                        backgroundColor: "#FF6F4A",
                        paddingVertical: 10,
                        paddingHorizontal: 11,
                        borderRadius: 10,
                        marginHorizontal: 20
                      }}
                    >
                      <FontAwesome5 name="plus" size={20} color="white" />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityStates={isFocused ? ["selected"] : []}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Animated.Text
                    style={{
                      marginBottom: 6
                    }}
                  >
                    {isFocused ? icon.focused : icon.blurred}
                  </Animated.Text>
                  <Animated.Text
                    style={{
                      color: isFocused ? "#FF6F4A" : "#C5CEE0",
                      fontFamily: isFocused
                        ? "SourceSansProB"
                        : "SourceSansProSB",
                      fontSize: 12,
                      fontWeight: "600"
                    }}
                  >
                    {label}
                  </Animated.Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>
      <SafeAreaView style={{ backgroundColor: "white" }} />
    </View>
  );
};

const HomeTabs = () => {
  const { user } = useContext(AuthContext);

  return (
    <BottomTab.Navigator
      tabBar={(props) => {
        return <MyTabBar {...props} />;
      }}
    >
      <BottomTab.Screen
        name="QuestionHome"
        options={{
          title: "질문",
          icon: {
            focused: (
              <AntDesign name="questioncircleo" size={20} color="#FF6F4A" />
            ),
            blurred: (
              <AntDesign name="questioncircleo" size={20} color="#C5CEE0" />
            )
          }
        }}
        component={QuestionHomeScreen}
      />
      <BottomTab.Screen
        options={{
          title: "답변",
          icon: {
            focused: (
              <AntDesign name="exclamationcircleo" size={20} color="#FF6F4A" />
            ),
            blurred: (
              <AntDesign name="exclamationcircleo" size={20} color="#C5CEE0" />
            )
          }
        }}
        name="AnswerQuestionList"
        component={AnswerQuestionListScreen}
      />
      <BottomTab.Screen
        name="Alert"
        options={{
          title: "알림",
          icon: {
            focused: <AntDesign name="inbox" size={23} color="#FF6F4A" />,
            blurred: <AntDesign name="inbox" size={23} color="#C5CEE0" />
          }
        }}
        component={AlertScreen}
      />
      {/* <BottomTab.Screen
        options={{
          title: "보관함",
          icon: {
            focused: <AntDesign name="inbox" size={23} color="#FF6F4A" />,
            blurred: <AntDesign name="inbox" size={23} color="#C5CEE0" />
          }
        }}
        name="InboxTabs"
        component={InboxTabs}
      /> */}
      <BottomTab.Screen
        options={{
          title: "프로필",
          icon: {
            focused: <Feather name="user" size={20} color="#FF6F4A" />,
            blurred: <Feather name="user" size={20} color="#C5CEE0" />
          }
        }}
        name="UserProfite"
        component={ProfileScreen}
        initialParams={{ userID: user?.sub, settingsShown: true }}
      />
    </BottomTab.Navigator>
  );
};

const CustomInboxTabBar = ({ state, descriptors, navigation, position }) => {
  return (
    <View>
      <SafeAreaView style={{ backgroundColor: "white" }} />
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 25,
          paddingTop: 40,
          paddingBottom: 12
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 24 }}>내 보관함</Text>
      </View>
      <View style={{ backgroundColor: "white" }}>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            paddingHorizontal: 25,
            borderBottomColor: "rgba(35,35,35,0.5)"
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
              Keyboard.dismiss();
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key
              });
              Keyboard.dismiss();
            };

            const inputRange = state.routes.map((_, i) => i);
            const opacity = Animated.interpolate(position, {
              inputRange,
              outputRange: inputRange.map((i) => (i === index ? 1 : 0))
            });

            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityStates={isFocused ? ["selected"] : []}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomWidth: isFocused ? 2 : 0,
                  borderBottomColor: isFocused ? "#353535" : "none",
                  marginRight: 8
                }}
                key={route.key}
              >
                <Animated.Text
                  style={{
                    fontWeight: isFocused ? "bold" : "normal",
                    fontFamily: isFocused ? "SourceSansProB" : "SourceSansPro",
                    opacity: isFocused ? 1 : 0.5,
                    paddingVertical: 12,
                    paddingBottom: isFocused ? 10 : 12,
                    paddingHorizontal: 16,
                    fontSize: 14
                  }}
                >
                  {label}
                </Animated.Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const InboxTopTab = createMaterialTopTabNavigator();

const InboxTabs = () => {
  return (
    <InboxTopTab.Navigator tabBar={(props) => <CustomInboxTabBar {...props} />}>
      <InboxTopTab.Screen
        name="MyQuestion"
        options={{ title: "질문" }}
        component={MyQuestionScreen}
      />
      <InboxTopTab.Screen
        name="MyAnswer"
        options={{ title: "답변" }}
        component={MyAnswerScreen}
      />
    </InboxTopTab.Navigator>
  );
};

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerBackImage: () => (
          <Entypo
            name="chevron-thin-left"
            size={22}
            style={{ marginLeft: 15 }}
            color="black"
          />
        ),
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
        headerStyle: {
          shadowRadius: 0,
          shadowOffset: {
            height: 0
          }
        }
      }}
    >
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }}
        component={HomeTabs}
      />
      <Stack.Screen
        name="NewQuestion"
        options={{ title: "질문하기" }}
        component={NewQuestionScreen}
      />
      <Stack.Screen
        name="NewAnswer"
        options={{ title: "답변하기" }}
        component={NewAnswerScreen}
      />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />
      <Stack.Screen
        //추후 "MyQuestion" 을 "Inbox" 로 모든 스크린 navigation 에서 바꿀 필요 있음
        name="MyQuestion"
        options={{ title: "내 보관함" }}
        component={InboxTabs}
      />
      <Stack.Screen
        name="Setting"
        options={{ title: "설정" }}
        component={SettingScreen}
      />
      <Stack.Screen
        name="Question"
        options={{ title: "" }}
        component={QuestionScreen}
      />
      <Stack.Screen
        name="NoticeList"
        options={{ title: "공지사항" }}
        component={NoticeListScreen}
      />
      <Stack.Screen name="Notice" component={NoticeScreen} />
      <Stack.Screen
        name="FAQ"
        options={{ title: "고객센터" }}
        component={FAQScreen}
      />
      <Stack.Screen name="ModifyQuestion" component={ModifyQuestionScreen} />
      <Stack.Screen name="ModifyAnswer" component={ModifyAnswerScreen} />
      <Stack.Screen
        name="ProfileEdit"
        options={{ title: "프로필 수정" }}
        component={ProfileEditScreen}
      />
      <Stack.Screen
        name="Profile"
        options={{ title: "" }}
        component={ProfileModalScreen}
        initialParams={{ settingsShown: false }}
      />
    </Stack.Navigator>
  );
};

// 앱 내부 링크 구성 - 구성한 뒤 myapp://link/id 등의 방식으로 접근 가능
const prefix = Linking.makeUrl("/");
const linking = {
  prefixes: [prefix],
  config: {
    initialRouteName: "Home",
    screens: {
      Question: "question/:questionId",
      Home: {
        screens: {
          InboxTabs: "inbox"
        }
      },
      NewQuestion: "newquestion"
    }
  }
};

const HomeStack = () => {
  // Notification 리스너 - 푸시 알림 클릭 시 실행되는 함수
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (response.notification.request.content.data.url) {
          const link = Linking.makeUrl(
            response.notification.request.content.data.url
          );
          Linking.openURL(link);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <MainStack />
    </NavigationContainer>
  );
};

export default HomeStack;
