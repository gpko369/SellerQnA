import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { LinearGradient } from "expo-linear-gradient";
import { Auth } from "@aws-amplify/auth";
import { AuthContext } from "../../context/AuthContext";
import { validatePassword } from "../../utility/utilFunctions";

const SignUpPassword = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params.email);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);

  useEffect(() => {
    if (!route.params.email) {
      navigation.goBack();
    }
  }, []);

  const onPressNext = () => {
    if (validatePassword(password)) {
      if (password != password2) {
        Alert.alert("비밀번호가 일치하지 않습니다.");
      } else {
        navigation.navigate("SignUpPhone", {
          email: email,
          password: password
        });
      }
    } else
      Alert.alert(
        "암호는 8글자 이상 이면서 영어 알파벳, 숫자, 특수기호가 포함되어야 합니다."
      );
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : null}
        enabled
        style={{
          flex: 1,
          justifyContent: "space-between",
          padding: 20,
          backgroundColor: "white"
        }}
        keyboardVerticalOffset={85}
      >
        <View></View>
        <View>
          <Text style={{ fontSize: 28, fontWeight: "800" }}>비밀번호를</Text>
          <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 10 }}>
            입력해주세요.
          </Text>
          <TextInput
            style={styles.textInput}
            autoFocus={true}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            placeholder="비밀번호를 입력해주세요."
            value={password}
          />
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => setPassword2(text)}
            secureTextEntry={true}
            placeholder="비밀번호를 확인해주세요."
            value={password2}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={onPressNext}>
            <LinearGradient
              colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
              style={styles.gradientButton}
              start={[1, -0.5]}
              end={[-0.5, 1]}
            />
            <Text style={styles.buttonText}>다음 단계</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.65,
    elevation: 6,
    marginBottom: 15
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    padding: 15,
    fontWeight: "bold"
  },
  gradientButton: {
    position: "absolute",
    borderRadius: 24,
    left: 0,
    right: 0,
    top: 0,
    height: "100%"
  },
  textInput: {
    height: 48,
    borderColor: "rgb(173,173,173)",
    borderBottomWidth: 0.5,
    backgroundColor: "white",
    paddingHorizontal: 0,
    borderRadius: 3,
    marginTop: 5,
    marginBottom: 8,
    marginHorizontal: 4
  }
});

export default SignUpPassword;
