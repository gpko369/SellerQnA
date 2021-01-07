import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { validatePassword } from "../../utility/utilFunctions";

const ForgotPasswordScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [margin, setMargin] = useState(0);
  const scrollView = useRef(null);

  // useEffect(() => {
  //   if (Platform.OS === "ios")
  //     setTimeout(() => scrollView.current.scrollToEnd(), 200);
  // }, [margin]);

  const submitUsername = async () => {
    if (code.length != 6) {
      Alert.alert("인증번호 6자리를 입력해주세요.");
    } else if (!validatePassword(password)) {
      Alert.alert(
        "암호는 8글자 이상 이면서 영어 알파벳, 숫자, 특수기호가 포함되어야 합니다."
      );
    } else if (password != password2) {
      Alert.alert("비밀번호가 일치하지 않습니다.");
    } else {
      try {
        const result = await Auth.forgotPasswordSubmit(
          username,
          code,
          password
        );
        Alert.alert(
          "비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.",
          "",
          [
            {
              text: "확인",
              onPress: () =>
                navigation.navigate("EmailLogin", {
                  username: username
                })
            }
          ],
          { cancelable: false }
        );
      } catch (err) {
        if (err.code === "CodeMismatchException") {
          Alert.alert("인증 번호가 올바르지 않습니다.");
        }
        console.log(err);
      }
    }
  };

  const verify = async () => {
    try {
      const result = await Auth.forgotPassword(username);
      setIsCodeSent(true);
      Alert.alert(
        result.CodeDeliveryDetails.Destination +
          "로 인증번호가 발송되었습니다.\n인증번호와 함께 새로운 비밀번호를 입력해주세요.",
        "",
        [
          {
            text: "확인"
          }
        ]
      );
    } catch (err) {
      console.log(err);
      if (err.code == "UserNotFoundException") {
        Alert.alert(
          "가입되지 않은 이메일이거나, 해당 회원을 찾을 수 없습니다."
        );
      } else if (err.code == "LimitExceededException") {
        Alert.alert(
          "일일 제한 횟수 초과입니다. 시간이 지난 뒤 다시 시도해주세요."
        );
      }
    }
  };
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={{ flex: 1, justifyContent: "center", opacity: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : null}
          enabled
          style={styles.container}
          keyboardVerticalOffset={60}
        >
          <View style={{ ...styles.paddingContainer }}>
            <ScrollView style={{ flex: 1 }} ref={scrollView}>
              <View style={{ flex: 1, marginBottom: 100 }}>
                <Text style={styles.introText}>이메일 입력</Text>
                <View style={{ flexDirection: "row" }}>
                  <TextInput
                    style={{ ...styles.textInput, flex: 1 }}
                    onChangeText={(text) => setUsername(text)}
                    placeholder="이메일 주소 입력"
                    keyboardType="email-address"
                    editable={isLoading ? false : true}
                    autoFocus={true}
                    value={username}
                  />
                  <TouchableOpacity
                    onPress={verify}
                    style={styles.verificationButton}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      {isCodeSent ? "재전송" : "인증"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {isCodeSent && (
                  <>
                    <Text style={styles.introText}>인증번호</Text>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={(text) => setCode(text)}
                      placeholder="인증번호 6자리"
                      keyboardType="number-pad"
                      editable={isLoading ? false : true}
                      value={code}
                      onFocus={() => scrollView.current.scrollToEnd()}
                    />
                    <Text style={styles.introText}>변경할 비밀번호</Text>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={(text) => setPassword(text)}
                      secureTextEntry={true}
                      placeholder="영문, 숫자 포함 8자리 이상"
                      editable={isLoading ? false : true}
                      value={password}
                      onFocus={() => scrollView.current.scrollToEnd()}
                    />
                    <Text style={styles.introText}>비밀번호 확인</Text>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={(text) => setPassword2(text)}
                      secureTextEntry={true}
                      placeholder="입력할 비밀번호 다시 입력"
                      editable={isLoading ? false : true}
                      value={password2}
                      onFocus={() => scrollView.current.scrollToEnd()}
                    />
                  </>
                )}
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={submitUsername}
              style={styles.signinButton}
            >
              <Text style={styles.signinButtonText}>다음</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch"
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
    opacity: 0.4
  },
  paddingContainer: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: "stretch"
  },
  introText: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "bold"
  },
  textInput: {
    height: 48,
    borderColor: "rgb(173,173,173)",
    borderWidth: 0.5,
    borderRadius: 5,
    backgroundColor: "white",
    paddingHorizontal: 0,
    marginHorizontal: 4,
    paddingLeft: 20
  },
  forgotPassword: {
    marginTop: 12,
    alignItems: "center"
  },
  signinButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 40,
    borderRadius: 25,
    backgroundColor: "#FF6F4A"
  },
  signinButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold"
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
  }
});
