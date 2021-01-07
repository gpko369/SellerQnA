import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback
} from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Switch,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ImageBackground
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";
import { S3Image } from "../../components/CustomImage";

import { Auth } from "@aws-amplify/auth";
import { AuthContext } from "../../context/AuthContext";
import * as Permissions from "expo-permissions";

import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import ServiceOfTerms from "../UseOfTerms/ServiceOfTerms";
import PrivacyPolicy from "../UseOfTerms/PrivacyPolicy";

import { AntDesign } from "@expo/vector-icons";

import { openChat } from "../../utility/openChat";
import { uploadImage, imagePicker } from "../../utility/imageUploader";

const SettingScreen = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);
  const [isEnabledNotification, setIsEnabledNotification] = useState(false);
  const [isEnabledMarketing, setIsEnabledMarketing] = useState(false);
  const [userName, setUserName] = useState("");
  const [prevUserName, setPrevUserName] = useState("");
  const [usernameEditable, setUsernameEditable] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceOfTermsVisible, setServiceOfTermsVisible] = useState(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [profileImageS3Key, setProfileImageS3Key] = useState(null);
  const userNameRef = useRef(null);

  const getNotificationPermission = async () => {
    //디바이스의 현재 알림 허용 상태를 요청
    const { permissions } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    if (!permissions.notifications.granted) {
      setIsEnabledNotification(false);
    } else if (permissions.notifications.granted) {
      setIsEnabledNotification(true);
    }
  };

  const getUserProfile = async () => {
    try {
      const result = await API.graphql(
        graphqlOperation(queries.getUser, { id: user.sub })
      );
      setUserName(result.data.getUser.username);
      if (result.data.getUser?.profileImageS3ObjectKey)
        setProfileImageS3Key(result.data.getUser.profileImageS3ObjectKey);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      getNotificationPermission();
      getUserProfile();
      setUserEmail(user.email);
    }
  }, [user]);

  const toggleNotificationSwitch = async () => {
    if (isEnabledNotification) {
      //디바이스의 알림을 해제할 수 있는 권한은 사용자에게만 있음
      Alert.alert("설정>알림 에 들어가서 알림을 해제해주세요.");
    } else {
      //디바이스의 알림 허용을 요청, 디바이스 당 단 한번 요청 팝업을 뜨게 할 수 있음
      const { permissions } = await Permissions.askAsync(
        Permissions.NOTIFICATIONS
      );
      if (permissions.notifications.granted) {
        setIsEnabledNotification(true);
      } else {
        //알림 허용 요청 팝업을 띄울 수 없게 된 경우 사용자가 직접 디바이스의 설정에서 변경해야함
        Alert.alert("설정>알림 에 들어가서 알림을 허용해주세요.");
        setIsEnabledNotification(false);
      }
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUserObj({});
      checkAuth();
    } catch (error) {
      Alert.alert(error);
    }
  };

  const logout = () => {
    Alert.alert(
      "로그아웃하시겠습니까?",
      "",
      [
        {
          text: "아니오",
          style: "cancel"
        },
        { text: "예", onPress: signOut }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    if (usernameEditable) {
      userNameRef.current.focus();
    }
  }, [usernameEditable]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getUserProfile();
    });

    return () => {
      unsubscribe;
    };
  }, [navigation]);

  const TermsModal = () => (
    <Modal transparent={true} visible={modalVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <ScrollView style={{ height: 320 }}>
            {serviceOfTermsVisible && <ServiceOfTerms />}
            {privacyPolicyVisible && <PrivacyPolicy />}
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setServiceOfTermsVisible(false);
              setPrivacyPolicyVisible(false);
            }}
            style={{ alignSelf: "center", marginTop: 16 }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#FF6F4A" }}
            >
              닫기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TermsModal />
        {/* <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Item title={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      /> */}
        <ScrollView>
          <View>
            <Text style={styles.header}>프로필 및 계정</Text>
          </View>
          <View style={styles.item}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <S3Image
                imgKey={profileImageS3Key}
                style={{
                  height: 35,
                  width: 35,
                  marginRight: 15,
                  borderRadius: 17.5
                }}
              />
              <TextInput
                style={styles.username}
                onChangeText={(text) => setUserName(text)}
                value={userName}
                editable={usernameEditable}
                selectTextOnFocus={true}
                ref={userNameRef}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileEdit")}
            >
              <Text>수정</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.item}>
            <Text>이메일 주소</Text>
            <Text style={{ opacity: 0.5 }}>{userEmail}</Text>
          </View>
          {/* <View style={styles.item}>
          <Text>연결된 계정</Text>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={require("../../img/facebook.png")}
              style={{ height: 16, width: 16, marginRight: 8 }}
            />
            <AntDesign
              style={{ marginRight: 8 }}
              name="apple1"
              size={16}
              color="black"
            />
            <Image
              source={require("../../img/google.png")}
              style={{ height: 16, width: 16, marginRight: 8 }}
            />
          </View>
        </View> */}
          <View>
            <ImageBackground
              source={require("../../img/open_chat_background.png")}
              style={{ height: 136 }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  paddingHorizontal: 25
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    marginTop: 22,
                    marginBottom: 16
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
                    아직도 외롭게 쇼핑몰 운영하시나요?
                  </Text>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 8
                    }}
                  >
                    셀러 Q&A 오픈채팅에서 자유롭게 소통하세요.
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FEE500",
                      height: 44,
                      alignSelf: "stretch",
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onPress={openChat}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <Image
                        source={require("../../img/kakao_login.png")}
                        style={{ height: 32, width: 28 }}
                      />
                      <Text style={{ fontWeight: "bold", alignSelf: "center" }}>
                        지금 바로 오픈채팅 참여하기
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View>
            <Text style={styles.header}>앱 설정</Text>
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleItemTitle}>알림</Text>
            <Switch
              trackColor={{ false: "#e3e3e3", true: "#31D856" }}
              thumbColor={"#ffffff"}
              ios_backgroundColor="#e3e3e3"
              onValueChange={toggleNotificationSwitch}
              value={isEnabledNotification}
            />
          </View>
          {/* <View style={styles.toggleItem}>
          <Text style={styles.toggleItemTitle}>이벤트 및 마케팅 알림</Text>
          <Switch
            trackColor={{ false: "#e3e3e3", true: "#31D856" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="#e3e3e3"
            onValueChange={toggleMarketingSwitch}
            value={isEnabledMarketing}
          />
        </View> */}
          <View>
            <Text style={styles.header}>고객 지원</Text>
          </View>
          {/* <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("NoticeList")}
        >
          <Text style={styles.itemTitle}>공지사항</Text>
        </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("FAQ")}
          >
            <Text style={styles.itemTitle}>고객센터</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.header}>서비스 약관</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setServiceOfTermsVisible(true);
            }}
            style={styles.item}
          >
            <Text style={styles.itemTitle}>서비스 이용약관</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setPrivacyPolicyVisible(true);
            }}
            style={styles.item}
          >
            <Text style={styles.itemTitle}>개인정보 처리방침</Text>
          </TouchableOpacity>
          {/* <View style={styles.item}>
          <Text style={styles.itemTitle}>오픈소스 라이센스</Text>
        </View> */}
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutTitle}>로그아웃</Text>
          </TouchableOpacity>
          {/* <View style={styles.delete}>
          <Text style={styles.itemTitle}>회원 탈퇴</Text>
        </View> */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    padding: 20,
    fontWeight: "bold",
    marginTop: 24
  },
  item: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  toggleItem: {
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  toggleItemTitle: {
    paddingVertical: 25
  },
  username: {
    fontWeight: "bold",
    flex: 1
  },
  logout: {
    marginTop: 35,
    padding: 25
  },
  logoutTitle: {
    fontWeight: "bold"
  },
  delete: {
    padding: 25
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: 325,
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 20
  }
});
