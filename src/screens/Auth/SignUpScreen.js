import React, { useEffect, useState, useRef, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Platform
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { Hub } from "@aws-amplify/core";

import { validatePassword } from "../../utility/utilFunctions";

import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../../graphql/mutations";
import * as queries from "../../graphql/queries";

const validateEmailFunction = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const SignUpScreen = ({ navigation }) => {
  const [isEmailRight, setIsEmailRight] = useState(null);
  const [isPasswordRight, setIsPasswordRight] = useState(null);
  const [isPassword2Right, setIsPassword2Right] = useState(null);
  const [isNicknameRight, setIsNicknameRight] = useState(null);
  const [isVerificationRight, setIsVerificationRight] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [margin, setMargin] = useState(0);
  const [userName, setUserName] = useState(null);
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);
  const [id, setId] = useState(null);
  const scrollView = useRef(null);
  const phoneInputRef = useRef(null);

  useEffect(() => {
    Hub.remove("auth");
  }, []);

  useEffect(() => {
    if (Platform.OS === "ios")
      setTimeout(() => scrollView.current.scrollToEnd(), 200);
  }, [margin]);

  const validateEmail = () => {
    if (validateEmailFunction(email)) {
      setIsEmailRight(true);
    } else setIsEmailRight(false);
  };

  const checkPassword = () => {
    if (validatePassword(password)) setIsPasswordRight(true);
    else setIsPasswordRight(false);
  };

  const checkPassword2 = () => {
    if (password === password2) setIsPassword2Right(true);
    else setIsPassword2Right(false);
  };

  const checkNickname = () => {
    setIsNicknameRight(true);
  };

  const verifyPhone = async () => {
    if (
      isEmailRight === true &&
      isPasswordRight === true &&
      isPassword2Right === true &&
      isNicknameRight === true &&
      verificationCount < 5
    ) {
      if (verificationCount > 0) {
        sendVerificationCode();
      } else {
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
      }
    } else if (verificationCount >= 5) {
      Alert.alert(
        "인증 최대 요청 수를 초과했습니다. 잠시 후 다시 시도해주세요."
      );
    } else Alert.alert("작성한 가입 정보를 다시 확인해주세요.");
  };

  const sendVerificationCode = async () => {
    try {
      setVerificationCount(verificationCount + 1);
      // Cognito 에 회원가입 요청
      const data = await Auth.signUp({
        username: email,
        password: password,
        attributes: { email: email, phone_number: "+82" + phone }
      });
      Alert.alert("인증 번호를 발송했습니다.");
      setIsVerificationCodeSent(true);
    } catch (err) {
      // 해당 이메일이 이미 존재할 때
      if (err.code === "UsernameExistsException") {
        try {
          const result = await Auth.resendSignUp(email);
          console.log(result);
          if (verificationCount != 0) {
            Alert.alert("인증번호가 재전송되었습니다.", "", [
              {
                text: "확인"
              }
            ]);
          }
        } catch (err) {
          // 해당 이메일로 가입한 유저가 이미 confirmed 되어 있을 때
          Alert.alert(
            "이미 해당 메일로 가입된 회원이 존재합니다. 다른 이메일을 사용해주세요.",
            "",
            [
              {
                text: "확인"
              }
            ]
          );
          setIsEmailRight(false);
          console.log(err);
        }
      }
      console.log(err);
    }
  };

  const signUp = async () => {
    if (
      isEmailRight === true &&
      isPasswordRight === true &&
      isPassword2Right === true &&
      isNicknameRight === true &&
      verificationCode
    ) {
      try {
        const data = await Auth.confirmSignUp(email, verificationCode);
        console.log(data);
        // 회원가입 완료된 정보를 가지고 로그인
        try {
          const user = await Auth.signIn(email, password, {
            type: "FirstSignIn"
          });
          navigation.navigate("SignUpComplete", {
            userName: email,
            password: password,
            nickname: nickname
          });
        } catch (err) {
          console.log(err);
          Alert.alert(
            "회원가입 과정 중 오류가 발생했습니다. 관리자에게 문의해주세요."
          );
          navigation.goBack();
        }

        // await createUser();
      } catch (err) {
        if (err.code == "CodeMismatchException") {
          Alert.alert("코드가 일치하지 않습니다. 다시 입력해주세요.");
        }
        console.log(err);
      }
    } else if (!isVerificationCodeSent) {
      Alert.alert("휴대폰 인증을 완료해주세요.");
    } else if (!verificationCode) {
      Alert.alert("인증 번호를 입력해주세요.");
    } else {
      Alert.alert("작성한 가입 정보를 다시 확인해주세요.");
    }
  };

  const onChangePhoneInput = (text) => {
    setPhone(text);
    if (text.length >= 11) {
      setMargin(0);
      phoneInputRef.current.blur();
    }
  };

  // const createUser = async () => {
  //   try {
  //     console.log(1);
  //     const user = await API.graphql(
  //       graphqlOperation(mutations.updateUser, {
  //         input: {
  //           id: id,
  //           createdAt: Date.now() + 32400000,
  //           confirmed: true
  //         }
  //       })
  //     );
  //     console.log(2);
  //     Alert.alert("회원가입이 완료되었습니다.", "", [{ text: "확인" }]);
  //     console.log(3);
  //     navigation.navigate("SignUpComplete", {
  //       userName: email,
  //       password: password
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setMargin(0);
        }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: "white" }}
          ref={scrollView}
        >
          <View style={styles.paddingContainer}>
            <Text
              style={
                isEmailRight === false
                  ? { fontWeight: "bold", color: "#D01B02" }
                  : { fontWeight: "bold" }
              }
            >
              {isEmailRight === false ? "이메일을 확인해주세요." : "이메일"}
            </Text>
            <TextInput
              style={{
                ...(isEmailRight === true
                  ? styles.textInputRight
                  : isEmailRight === false
                  ? styles.textInputWrong
                  : styles.textInput),
                color: isVerificationCodeSent ? "#b2b2b2" : "#000"
              }}
              placeholder="이메일"
              keyboardType="email-address"
              autoFocus={true}
              value={email}
              onChangeText={(text) => setEmail(text)}
              onFocus={() => setMargin(0)}
              onBlur={validateEmail}
              editable={!isVerificationCodeSent}
            />
            <Text
              style={
                isPasswordRight === false
                  ? { fontWeight: "bold", color: "#D01B02" }
                  : { fontWeight: "bold" }
              }
            >
              {isPasswordRight === false
                ? "비밀번호를 확인해주세요."
                : "비밀번호"}
            </Text>
            <TextInput
              style={
                isPasswordRight === true
                  ? styles.textInputRight
                  : isPasswordRight === false
                  ? styles.textInputWrong
                  : styles.textInput
              }
              secureTextEntry={true}
              placeholder="영문, 숫자 및 특수문자 포함 8자리 이상"
              value={password}
              onChangeText={(text) => setPassword(text)}
              onFocus={() => setMargin(0)}
              onBlur={checkPassword}
              editable={!isVerificationCodeSent}
            />
            <Text
              style={
                isPassword2Right === false
                  ? { fontWeight: "bold", color: "#D01B02" }
                  : { fontWeight: "bold" }
              }
            >
              {isPassword2Right === false
                ? "비밀번호가 일치하지 않습니다."
                : "비밀번호 확인"}
            </Text>
            <TextInput
              style={
                isPassword2Right === true
                  ? styles.textInputRight
                  : isPassword2Right === false
                  ? styles.textInputWrong
                  : styles.textInput
              }
              secureTextEntry={true}
              placeholder="입력한 비밀번호 다시 입력"
              value={password2}
              onChangeText={(text) => setPassword2(text)}
              onFocus={() => setMargin(0)}
              onBlur={checkPassword2}
              editable={!isVerificationCodeSent}
            />
            <Text style={{ fontWeight: "bold" }}>닉네임</Text>

            <TextInput
              style={{
                ...(isNicknameRight === null
                  ? styles.textInput
                  : isNicknameRight === true && nickname.length >= 2
                  ? styles.textInputRight
                  : styles.textInputWrong),
                color: isVerificationCodeSent ? "#b2b2b2" : "#000"
              }}
              placeholder="두글자 이상"
              value={nickname}
              onChangeText={(text) => setNickname(text)}
              onFocus={() => setMargin(300)}
              onBlur={checkNickname}
              editable={!isVerificationCodeSent}
            />

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
                onChangeText={onChangePhoneInput}
                onFocus={() => {
                  setMargin(300);
                  phoneInputRef.current.clear();
                }}
                ref={phoneInputRef}
              />
              <TouchableOpacity
                onPress={verifyPhone}
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
              onFocus={() => setMargin(300)}
            />
            <View style={{ marginBottom: margin }} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      <TouchableOpacity onPress={signUp} style={styles.nextButton}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
          다음
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default SignUpScreen;

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
