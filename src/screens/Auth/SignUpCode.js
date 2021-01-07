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
import { Hub } from "@aws-amplify/core";
import { AuthContext } from "../../context/AuthContext";
import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../../graphql/mutations";

const SignUpCode = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const { isAuthenticated, checkAuth, setUserObj } = useContext(AuthContext);

  useEffect(() => {
    if (!route.params.user) {
      navigation.goBack();
    }
  }, []);

  const createUser = async () => {
    try {
      const user = await API.graphql(
        graphqlOperation(mutations.createUser, {
          input: {
            id: route.params.userAttribute.id,
            phone: route.params.userAttribute.phone_number,
            email: route.params.userAttribute.email,
            username: route.params.userAttribute.username,
            createdAt: Date.now() + 32400000
          }
        })
      );
      Alert.alert("회원가입이 완료되었습니다.", "", [{ text: "확인" }]);
    } catch (err) {
      console.log(err);
    }
  };

  const signIn = async () => {
    try {
      const user = await Auth.signIn(
        route.params.userAttribute.username,
        route.params.userAttribute.password
      );
      checkAuth();
      createUser();
    } catch (err) {
      console.log(err);
      Alert.alert("아이디와 비밀번호를 확인해주세요.");
    }
  };

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          checkAuth();
      }
    });
  }, []);

  const verifyCode = async () => {
    try {
      const data = await Auth.confirmSignUp(
        route.params.user.username,
        verificationCode
      );
      signIn();
    } catch (err) {
      if (err.code == "CodeMismatchException") {
        Alert.alert("코드가 일치하지 않습니다. 다시 입력해주세요.");
      }
      console.log(err);
    }
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
          <Text style={{ fontSize: 28, fontWeight: "800" }}>본인인지</Text>
          <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 15 }}>
            한 번만 확인해볼게요.
          </Text>
          <TextInput
            style={styles.textInput}
            autoFocus={true}
            onChangeText={(text) => setVerificationCode(text)}
            placeholder="6자리 인증번호를 입력해주세요."
            keyboardType="numeric"
            clearTextOnFocus={true}
            value={verificationCode}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={verifyCode}>
            <LinearGradient
              colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
              style={styles.gradientButton}
              start={[1, -0.5]}
              end={[-0.5, 1]}
            />
            <Text style={styles.buttonText}>인증 확인</Text>
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
    marginTop: 15,
    marginBottom: 8,
    marginHorizontal: 4
  }
});

export default SignUpCode;
