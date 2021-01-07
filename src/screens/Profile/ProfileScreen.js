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
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions
} from "react-native";

import { Text } from "../../components/CustomFontText";
import { S3Image } from "../../components/CustomImage";

import { getUserProfile } from "../../utility/userProfileGetter";
import { AuthContext } from "../../context/AuthContext";

import UserQuestionScreen from "./UserQuestionScreen";
import UserAnswerScreen from "./UserAnswerScreen";

import { Feather } from "@expo/vector-icons";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const initialButton = [
  { title: "질문", selected: true },
  { title: "답변", selected: false }
];

const ProfileScreen = ({ navigation, route }) => {
  console.log(route);
  const [profile, setProfile] = useState({});
  const [selectedButton, setSelectedButton] = useState("질문");
  const [
    questionListComponentHeight,
    setQuestionListComponentHeight
  ] = useState(0);
  const [answerListComponentHeight, setAnswerListComponentHeight] = useState(0);
  const [buttons, setButtons] = useState(initialButton);
  const [containerHeight, setContainerHeight] = useState(null);
  const [containerYIndex, setContainerYIndex] = useState(null);
  const mainScrollRef = useRef();
  const tabbarRef = useRef();
  const { user } = useContext(AuthContext);

  const Tab = createMaterialTopTabNavigator();

  const Abb = useCallback(
    ({ selectedButton }) => (
      <View
        onLayout={(event) => {
          var { height } = event.nativeEvent.layout;
          if (height > 0) {
            setQuestionListComponentHeight(height);
          }
        }}
      >
        <UserQuestionScreen
          userID={route.params.userID}
          navigation={navigation}
          selectedButton={selectedButton}
        />
      </View>
    ),
    []
  );

  const Bbb = useCallback(
    ({ selectedButton }) => (
      <View
        onLayout={(event) => {
          var { height } = event.nativeEvent.layout;
          if (height > 0) {
            setAnswerListComponentHeight(height);
          }
        }}
      >
        <UserAnswerScreen
          userID={route.params.userID}
          navigation={navigation}
          selectedButton={selectedButton}
        />
      </View>
    ),
    []
  );

  useEffect(() => {
    if (questionListComponentHeight > 0 && answerListComponentHeight > 0) {
      if (selectedButton == "질문") {
        setContainerHeight(questionListComponentHeight);
        if (containerYIndex) {
          tabbarRef.current.measure((fx, fy, width, height, px, py) => {
            if (py - height + 3 < 0) {
              mainScrollRef.current.scrollTo({
                y: containerYIndex,
                animated: false
              });
            }
          });
        }
      } else {
        setContainerHeight(answerListComponentHeight);
        if (containerYIndex) {
          tabbarRef.current.measure((fx, fy, width, height, px, py) => {
            if (py - height + 3 < 0) {
              mainScrollRef.current.scrollTo({
                y: containerYIndex,
                animated: false
              });
            }
          });
        }
      }
    }
  }, [
    questionListComponentHeight,
    answerListComponentHeight,
    containerHeight,
    selectedButton,
    containerYIndex
  ]);

  const userProfile = async () => {
    const result = await getUserProfile(route.params.userID);
    setProfile(result);
  };

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", (e) => {
      userProfile().catch((err) => console.log(err));
    });

    return unsubscribeFocus;
  }, [navigation]);

  const ProfileTab = ({ setSelectedButton }) => {
    const renderButton = (button) => {
      return (
        <TouchableOpacity
          style={{
            ...styles.button,
            borderBottomWidth: 4,
            borderBottomColor: button.selected ? "#FF6F4A" : "#EDEFF3"
          }}
          onPress={() => {
            setButtons((prev) =>
              prev.map((item) => {
                if (item.title === button.title) {
                  item.selected = true;
                } else item.selected = false;
                return item;
              })
            );
            setSelectedButton(button.title);
            if (button.title == "답변") {
              navigation.jumpTo("Answer");
            } else {
              navigation.jumpTo("Question");
            }
          }}
          key={button.title}
        >
          <Text
            style={{
              fontWeight: button.selected ? "bold" : "600",
              color: button.selected ? "#FF6F4A" : "#8F9BB3"
            }}
          >
            {button.title}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <View
        ref={tabbarRef}
        style={{ flexDirection: "row", backgroundColor: "white" }}
        onLayout={(event) =>
          tabbarRef.current.measure((fx, fy, width, height, px, py) => {
            if (py >= containerYIndex) {
              setContainerYIndex(py - height + 4);
            }
          })
        }
      >
        {buttons.map((button) => renderButton(button))}
        <View
          style={{
            flex: 1,
            borderBottomWidth: 4,
            borderBottomColor: "#EDEFF3"
          }}
        />
      </View>
    );
  };

  return profile ? (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ backgroundColor: "white" }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: "white" }}
        stickyHeaderIndices={[1]}
        ref={mainScrollRef}
        bounces={false}
      >
        <View style={styles.paddingContainer}>
          {route.params?.settingsShown === true && (
            <TouchableOpacity
              style={{ alignItems: "flex-end", marginTop: 12 }}
              onPress={() => navigation.navigate("Setting")}
            >
              <Feather name="settings" size={24} color="black" />
            </TouchableOpacity>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 26,
              marginTop: 20
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 24 }}>
                안녕하세요.
              </Text>
              <Text style={{ fontWeight: "bold", fontSize: 24 }}>
                {profile.userName}입니다.
              </Text>
            </View>
            <S3Image
              imgKey={profile.userImage}
              style={{ width: 72, height: 72, borderRadius: 36 }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 31
            }}
          >
            <Image
              source={require("../../img/profileNumberImage.png")}
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            <Text style={{ fontWeight: "bold", marginRight: 8 }}>질문</Text>
            <Text style={{ marginRight: 8 }}>{profile.numberOfQuestions}</Text>
            <Text style={{ fontWeight: "bold", marginRight: 8 }}>답변</Text>
            <Text style={{ marginRight: 8 }}>{profile.numberOfAnswers}</Text>
            <Text style={{ fontWeight: "bold", marginRight: 8 }}>채택</Text>
            <Text style={{ marginRight: 8 }}>
              {profile.numberOfChosenAnswers}
            </Text>
          </View>
          <Text>{profile.introduction}</Text>
        </View>
        <ProfileTab setSelectedButton={setSelectedButton} />
        <Tab.Navigator
          tabBar={(props) => null}
          sceneContainerStyle={{
            backgroundColor: "white",
            height: containerHeight
          }}
          lazy={true}
          swipeEnabled={false}
        >
          <Tab.Screen
            name="Question"
            component={Abb}
            options={{ tabBarLabel: "질문" }}
          />
          <Tab.Screen
            name="Answer"
            component={Bbb}
            options={{ tabBarLabel: "답변" }}
          />
        </Tab.Navigator>

        {/* <View>
          <ProfileTab
            userID={route.params.userID}
            profile={profile}
            setSelectedButton={(title) => setSelectedButton(title)}
          />
        </View>
        <A selectedButton={selectedButton} profile={profile} />
        <B selectedButton={selectedButton} profile={profile} /> */}
        {/* <RenderContents selectedButton={selectedButton} /> */}
      </ScrollView>
    </View>
  ) : null;
};

export default ProfileScreen;

const styles = StyleSheet.create({
  paddingContainer: {
    paddingHorizontal: 25,
    paddingBottom: 38
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12
  }
});
