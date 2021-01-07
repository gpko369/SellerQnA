import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import * as Linking from "expo-linking";

import { AuthContext } from "../../context/AuthContext";
import { Auth } from "@aws-amplify/auth";
import { Hub } from "aws-amplify";

import { FontAwesome, Entypo } from "@expo/vector-icons";

const SignInSelectScreen = ({ navigation }) => {
  const [isSocial, setIsSocial] = useState(false);
  const { isAuthenticated, checkAuth, setUserObj } = useContext(AuthContext);

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "customOAuthState":
          console.log(event);
          console.log(data);
          if (data === "social") {
            checkAuth();
          }
      }
    });
    return () => {
      Hub.remove("auth");
    };
  }, []);

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

  return (
    <View style={styles.container}>
      <View style={styles.paddingContainer}>
        <View style={{ flex: 1 }}>
          <Image
            source={require("../../img/icon_with_text.png")}
            style={{
              marginTop: 230,
              width: 158,
              height: 43.96,
              alignSelf: "center"
            }}
          />
        </View>
        {isSocial && (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{ fontSize: 12, fontWeight: "bold", marginBottom: 16 }}
            >
              다른 계정 로그인
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={googleSignIn}>
                <Image
                  source={require("../../img/google.png")}
                  style={{ width: 40, height: 40 }}
                />
              </TouchableOpacity>
              {Platform.OS === "ios" && (
                <TouchableOpacity onPress={facebookSignIn}>
                  <Image
                    source={require("../../img/facebook.png")}
                    style={{ width: 40, height: 40, marginLeft: 20 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate("EmailLogin")}
          style={{
            ...styles.button,
            backgroundColor: isSocial ? "#ffffff" : "#353535",
            marginTop: 33
          }}
        >
          <Text style={{ color: isSocial ? "#353535" : "white" }}>
            이메일로 시작하기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (isSocial && Platform.OS === "ios") {
              AppleSignIn();
            } else if (isSocial && Platform.OS === "android") facebookSignIn();
            else {
              setIsSocial(true);
            }
          }}
          style={{
            ...styles.button,
            backgroundColor: isSocial
              ? Platform.OS === "ios"
                ? "#000000"
                : "#3B5998"
              : null,
            marginBottom: 20,
            marginTop: 11
          }}
        >
          {!isSocial && <Text>소셜 계정으로 시작하기</Text>}
          {isSocial && Platform.OS === "ios" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../img/apple_logo.png")}
                style={{ width: 24, height: 24, marginRight: 6 }}
              />
              <Text style={{ color: "white" }}>Apple로 로그인</Text>
            </View>
          )}
          {isSocial && Platform.OS === "android" && (
            <View style={{ flexDirection: "row" }}>
              <Image
                source={require("../../img/facebook_with_circle.png")}
                style={{ width: 16, height: 16, marginRight: 10 }}
              />
              <Text style={{ color: "white" }}>페이스북으로 로그인</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL("http://pf.kakao.com/_KkEdK/chat")}
          style={{ alignSelf: "center", marginBottom: 55 }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 12 }}>문의하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignInSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  paddingContainer: {
    flex: 1,
    paddingHorizontal: 25
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: 47,
    borderWidth: 1,
    borderColor: "#353535",
    borderRadius: 50
  }
});
