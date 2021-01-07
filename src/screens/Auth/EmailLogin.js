import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import * as Linking from "expo-linking";

import { AuthContext } from "../../context/AuthContext";
import { Auth } from "@aws-amplify/auth";
import { Hub } from "aws-amplify";

const width = Dimensions.get("screen").width;

const EmailLogin = ({ navigation, route }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signUpVisible, setSignUpVisible] = useState(true);
  const { isAuthenticated, checkAuth, setUserObj } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    if (username === "") {
      Alert.alert("아이디를 입력해주세요.");
    } else if (password === "") {
      Alert.alert("비밀번호를 입력해주세요.");
    } else {
      try {
        setIsLoading(true);
        const user = await Auth.signIn(username, password);
        checkAuth();
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        Alert.alert("아이디와 비밀번호를 확인해주세요.");
      }
    }
  };

  const facebookSignIn = async () => {
    try {
      await Auth.federatedSignIn({
        provider: "Facebook",
        customState: "social"
      });
    } catch (err) {
      console.log(err);
    }
  };

  const googleSignIn = async () => {
    try {
      await Auth.federatedSignIn({ provider: "Google", customState: "social" });
    } catch (err) {
      console.log(err);
    }
  };

  const AppleSignIn = async () => {
    try {
      await Auth.federatedSignIn({
        provider: "SignInWithApple",
        customState: "social"
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "customOAuthState":
          console.log(event);
          console.log(data);
          if (data === "social") {
            checkAuth();
          }
        // case "signIn":
        //   console.log(event);
        //   console.log(data.signInUserSession.idToken.payload);
        //   if (data.signInUserSession.idToken.payload.identities) {
        //     checkAuth();
        //     console.log("hurray!!");
        //   }
      }
    });
    return () => {
      Hub.remove("auth");
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          opacity: 1,
          backgroundColor: "white"
        }}
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#eb4c2a"
            style={{
              position: "absolute",
              alignSelf: "center",
              opacity: 1
            }}
          />
        ) : null}
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : null}
          enabled
          style={isLoading ? styles.blurContainer : styles.container}
          keyboardVerticalOffset={45}
        >
          <View style={styles.paddingContainer}>
            <View style={{ flex: 1 }}>
              <Image
                source={require("../../img/icon_with_text.png")}
                style={{
                  width: 158,
                  height: 44,
                  alignSelf: "center",
                  marginBottom: 40
                }}
              />
              <Text style={{ fontWeight: "bold" }}>이메일</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setUsername(text)}
                placeholder="이메일"
                keyboardType="email-address"
                editable={isLoading ? false : true}
                value={username}
              />
              <Text style={{ fontWeight: "bold" }}>비밀번호</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                placeholder="비밀번호"
                editable={isLoading ? false : true}
                value={password}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotPassword}
              >
                <Text
                  style={{
                    color: "rgba(53,53,53,0.6)",
                    textDecorationLine: "underline"
                  }}
                >
                  비밀번호를 잃어버렸어요
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              {/* <TouchableOpacity
              onPress={AppleSignIn}
              style={styles.facebookSigninButton}
            >
              <Image
                source={require("../../img/sagua.jpg")}
                style={styles.facebookLogoImage}
              />
              <Text style={styles.socialSigninButtonText}>
                Apple ID로 시작하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={facebookSignIn}
              style={styles.facebookSigninButton}
            >
              <Image
                source={require("../../img/facebook.png")}
                style={styles.facebookLogoImage}
              />
              <Text style={styles.socialSigninButtonText}>
                Facebook으로 시작하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={googleSignIn}
              style={styles.googleSigninButton}
            >
              <Image
                source={require("../../img/google.png")}
                style={styles.googleLogoImage}
              />
              <Text style={styles.socialSigninButtonText}>
                Google로 시작하기
              </Text>
            </TouchableOpacity> */}
              <TouchableOpacity
                onPress={isLoading ? null : () => signIn()}
                style={styles.signinButton}
              >
                <Text style={styles.signinButtonText}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        {signUpVisible && (
          <TouchableOpacity
            onPress={
              isLoading ? null : () => navigation.navigate("TermsAgreements")
            }
            style={{
              ...styles.signinButton,
              backgroundColor: "#353535",
              width: width - 50,
              marginBottom: Platform.OS === "ios" ? 20 : 10,
              marginHorizontal: 25
            }}
          >
            <Text style={styles.signinButtonText}>회원가입</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => Linking.openURL("http://pf.kakao.com/_KkEdK/chat")}
          style={{
            marginBottom: Platform.OS === "ios" ? 55 : 10,
            alignItems: "center"
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>문의하기</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
    paddingTop: 30
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
    opacity: 0.4,
    paddingTop: 70
  },
  paddingContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    alignItems: "stretch"
  },
  facebookSigninButton: {
    height: 48,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgb(206,206,206)",
    borderRadius: 25,
    flexDirection: "row"
  },
  googleSigninButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgb(206,206,206)",
    borderRadius: 25,
    flexDirection: "row"
  },
  googleLogoImage: {
    height: 20,
    width: 20,
    resizeMode: "contain",
    marginRight: 10
  },
  facebookLogoImage: {
    height: 22,
    width: 22,
    resizeMode: "contain",
    marginRight: 10
  },
  textInput: {
    height: 48,
    borderColor: "rgb(173,173,173)",
    borderWidth: 1,
    backgroundColor: "white",
    paddingLeft: 20,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 12
  },
  forgotPassword: {
    marginTop: 4,
    alignItems: "flex-end"
  },
  signinButton: {
    backgroundColor: "#FF6F4A",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 8,
    borderRadius: 25
  },
  signinButtonText: {
    color: "white",
    fontSize: 16,
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

export default EmailLogin;
