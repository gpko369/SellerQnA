import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { LinearGradient } from "expo-linear-gradient";
import { Auth } from "@aws-amplify/auth";

import { validatePassword } from "../../utility/utilFunctions";

const NewPasswordScreen = ({ navigation, route }) => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");

  const submitPassword = async () => {
    if (code.length != 6) {
      Alert.alert("인증번호 6자리를 입력해주세요.");
    } else if (!validatePassword(password)) {
      Alert.alert(
        "암호는 8글자 이상 이면서 영어 알파벳, 숫자, 특수기호가 포함되어야 합니다."
      );
    } else if (password != password1) {
      Alert.alert("비밀번호가 일치하지 않습니다.");
    } else {
      try {
        const result = await Auth.forgotPasswordSubmit(
          route.params.username,
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
                  username: route.params.username
                })
            }
          ],
          { cancelable: false }
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1, justifyContent: "center", opacity: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          enabled
          style={styles.container}
          keyboardVerticalOffset={15}
        >
          <View style={styles.paddingContainer}>
            <View>
              <Text style={styles.introText}>새로운 비밀번호 입력</Text>
            </View>
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => setCode(text)}
              placeholder="6자리 인증번호 입력"
              keyboardType="numeric"
              value={code}
              autoFocus={true}
            />
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              placeholder="비밀번호 입력"
              value={password}
            />
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => setPassword1(text)}
              secureTextEntry={true}
              placeholder="비밀번호 확인"
              value={password1}
            />

            <TouchableOpacity
              onPress={submitPassword}
              style={styles.signinButton}
            >
              <LinearGradient
                colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
                style={styles.gradientButton}
                start={[1, -0.5]}
                end={[-0.5, 1]}
              />
              <Text style={styles.signinButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NewPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center"
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
    justifyContent: "center",
    paddingHorizontal: 25,
    alignItems: "stretch"
  },
  introText: {
    marginBottom: 30,
    fontSize: 24,
    fontWeight: "800"
  },
  textInput: {
    height: 48,
    borderColor: "rgb(173,173,173)",
    borderBottomWidth: 0.5,
    backgroundColor: "white",
    paddingHorizontal: 0,
    borderRadius: 3,
    marginTop: 10,
    marginHorizontal: 4
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
    marginTop: 40,
    marginBottom: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.65,

    elevation: 6
  },
  signinButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold"
  },
  gradientButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 25
  }
});
