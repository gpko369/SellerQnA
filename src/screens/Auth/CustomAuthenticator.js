import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../context/AuthContext";
import { Auth } from "@aws-amplify/auth";
import { Hub } from "@aws-amplify/core";

const CustomAuthenticator = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated, checkAuth, setUserObj } = useContext(AuthContext);

  const signIn = async () => {
    if (username === "") {
      Alert.alert("아이디를 입력해주세요.");
    } else if (password === "") {
      Alert.alert("비밀번호를 입력해주세요.");
    } else {
      try {
        const user = await Auth.signIn(username, password);
        checkAuth();
      } catch (err) {
        console.log(err);
        Alert.alert("아이디와 비밀번호를 확인해주세요.");
      }
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

  const facebookSignIn = async () => {
    try {
      await Auth.federatedSignIn({ provider: "Facebook" });
      checkAuth();
    } catch (err) {
      console.log(err);
    }
  };

  const googleSignIn = async () => {
    try {
      await Auth.federatedSignIn({ provider: "Google" });
      checkAuth();
    } catch (err) {
      console.log(err);
    }
  };

  const onChangeUsername = (text) => {
    setUsername(text);
  };

  const onChangePassword = (text) => {
    setPassword(text);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.paddingContainer}>
          {/* <LinearGradient
        colors={["#3c5b65", "#3d4c78"]}
        style={styles.gradient}
        start={[1, -0.5]}
        end={[-0.5, 1]}
      /> */}
          <View>
            <Image
              style={styles.logoImage}
              source={require("../../img/qnalogo.png")}
            />
            <Text style={styles.introText}>당신만의 비즈니스 어드바이저</Text>
          </View>
          <View>
            {/* <TouchableOpacity
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
              onPress={() => navigation.navigate("EmailLogin")}
              style={styles.signinButton}
            >
              <LinearGradient
                colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
                style={styles.gradientButton}
                start={[1, -0.5]}
                end={[-0.5, 1]}
              />
              <Text style={styles.signinButtonText}>이메일 로그인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUp}
              onPress={() => navigation.navigate("SignUpEmail")}
            >
              <Text style={styles.signUpText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center"
  },
  paddingContainer: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: 25,
    alignItems: "stretch"
  },
  logoImage: {
    height: "20%",
    alignSelf: "center",
    resizeMode: "contain"
  },
  introText: {
    alignSelf: "center",
    color: "rgba(53,53,53,0.5)",
    marginBottom: 30,
    fontSize: 13
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%"
  },
  inputLabelText: {
    color: "rgb(53,53,53)"
  },
  textInput: {
    height: 48,
    borderColor: "rgb(53,53,53)",
    borderBottomWidth: 0.5,
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 4
  },
  signinButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",

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
  signinButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold"
  },
  socialSigninButtonText: {
    color: "rgb(53,53,53)",
    fontSize: 14
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
  gradientButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 25
  },
  signUp: {
    alignSelf: "center",
    padding: 15
  },
  signUpText: {
    color: "rgba(53, 53, 53, 0.6)"
  }
});

export default CustomAuthenticator;
