import React, { useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { LinearGradient } from "expo-linear-gradient";
import { Auth } from "@aws-amplify/auth";
import { AuthContext } from "../../context/AuthContext";

const SMSVerify = ({ navigation }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [isNicknameRight, setIsNicknameRight] = useState(null);
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone,
    setPhoneBool
  } = useContext(AuthContext);

  const checkNickname = () => {
    setIsNicknameRight(true);
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

  const onPressSMSRequest = async () => {
    if (isNicknameRight === true && verificationCount < 5) {
      Alert.alert(
        "입력하신 전화번호 " + phone + "(으)로 요청 하시겠습니까?",
        "",
        [
          { text: "아니오", style: "cancel" },
          {
            text: "예",
            onPress: sendVerificationCode
          }
        ]
      );
    } else if (verificationCount >= 5) {
      Alert.alert(
        "인증 최대 요청 수를 초과했습니다. 잠시 후 다시 시도해주세요."
      );
    } else Alert.alert("작성한 가입 정보를 다시 확인해주세요.");
  };

  const sendVerificationCode = async () => {
    try {
      const user0 = await Auth.currentAuthenticatedUser();
      if (!user0.attributes.phone_number) {
        await Auth.updateUserAttributes(user0, {
          phone_number: "+82" + phone
        });
      } else {
        await Auth.verifyCurrentUserAttribute("phone_number");
      }
      setIsVerificationCodeSent(true);
      setVerificationCount(verificationCount + 1);
      // navigation.navigate("SMSVerify");
    } catch (err) {
      console.log(err);
    }
  };

  const onPressSubmitCode = async () => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        "phone_number",
        verificationCode
      );
      try {
        const user0 = await Auth.currentAuthenticatedUser();
        const updateResult = await Auth.updateUserAttributes(user0, {
          phone_number_verified: true
        });
        console.log("phone verify update complete");
      } catch (err) {
        console.log("phone verify update failed");
        console.log(err);
      }
      navigation.navigate("SignUpComplete", {
        nickname: nickname,
        signInState: "social"
      });
    } catch (err) {
      console.log(err);
      if (err.code === "CodeMismatchException") {
        Alert.alert("인증 번호가 일치하지 않습니다. 다시 입력해주세요.");
      }
    }
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={styles.paddingContainer}>
            <Text style={{ fontWeight: "bold" }}>닉네임</Text>
            <View
              style={
                isNicknameRight === null
                  ? styles.textInput
                  : isNicknameRight === true && nickname.length >= 2
                  ? styles.textInputRight
                  : styles.textInputWrong
              }
            >
              <TextInput
                style={{
                  marginTop: Platform.OS === "ios" ? 9 : 0,
                  color: isVerificationCodeSent ? "#b2b2b2" : "#000"
                }}
                placeholder="두글자 이상"
                value={nickname}
                multiline={true}
                onChangeText={(text) => setNickname(text)}
                onBlur={checkNickname}
                editable={!isVerificationCodeSent}
              />
            </View>

            <Text style={{ fontWeight: "bold" }}>휴대폰 번호</Text>
            <View
              style={{ flexDirection: "row", marginTop: 8, marginBottom: 24 }}
            >
              <TextInput
                style={{
                  ...styles.textInput,
                  flex: 1,
                  marginTop: 0,
                  marginBottom: 0
                }}
                placeholder="0101234678"
                keyboardType="number-pad"
                value={phone}
                onChangeText={(text) => setPhone(text)}
              />
              <TouchableOpacity
                onPress={onPressSMSRequest}
                style={styles.verificationButton}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {isVerificationCodeSent ? "재요청" : "인증"}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "bold" }}>인증 번호</Text>
              {isVerificationCodeSent === true && (
                <Text style={{ fontSize: 12, opacity: 0.5 }}>
                  인증번호가 발송되었습니다.{" "}
                  {"(남은 요청 " + (5 - verificationCount) + "/5)"}
                </Text>
              )}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="인증번호 6자리"
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={(text) => setVerificationCode(text)}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableOpacity onPress={onPressSubmitCode} style={styles.nextButton}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
          다음
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  paddingContainer: { flex: 1, paddingHorizontal: 25, marginTop: 20 },
  textInput: {
    height: 48,
    borderColor: "rgb(173,173,173)",
    borderWidth: 1,
    backgroundColor: "white",
    paddingLeft: 20,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 24
  },
  textInputRight: {
    height: 48,
    borderColor: "#31D856",
    borderWidth: 1,
    backgroundColor: "white",
    paddingLeft: 20,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 24
  },
  textInputWrong: {
    height: 48,
    borderColor: "#D01B02",
    borderWidth: 1,
    backgroundColor: "white",
    paddingLeft: 20,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 24
  },
  verificationButton: {
    alignSelf: "center",
    backgroundColor: "#353535",
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    height: 40,
    marginLeft: 8,
    borderRadius: 40
  },
  nextButton: {
    height: 80,
    backgroundColor: "#FF6F4A",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default SMSVerify;
