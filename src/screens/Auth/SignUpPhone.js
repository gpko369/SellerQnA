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

import { validatePhone } from "../../utility/utilFunctions";

const SignUpPhone = ({ navigation, route }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(route.params.email);
  const [password, setPassword] = useState(route.params.password);

  useEffect(() => {
    if (!route.params.email) {
      navigation.navigate("SignUpEmail");
    } else if (!route.params.password) {
      navigation.navigate("SignUpEmail");
    }
  }, []);

  const signUp = async () => {
    if (validatePhone(phoneNumber)) {
      try {
        const data = await Auth.signUp({
          username: email,
          password: password,
          attributes: { email: email, phone_number: "+82" + phoneNumber }
        });
        navigation.navigate("SignUpCode", {
          user: data.user,
          userAttribute: {
            username: email,
            email: email,
            id: data.userSub,
            phone_number: phoneNumber,
            password: password
          }
        });
      } catch (err) {
        if (err.code === "UsernameExistsException") {
          Alert.alert(
            "이미 해당 메일로 가입된 회원이 존재합니다. 다른 이메일을 사용해주세요.",
            "",
            [
              {
                text: "확인",
                onPress: () => navigation.navigate("SignUpEmail")
              }
            ]
          );
        }
        console.log(err);
      }
    } else Alert.alert("휴대폰 번호를 '-'없이 입력해주세요.");
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
          <Text style={{ fontSize: 28, fontWeight: "800" }}>
            휴대전화 번호는
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 15 }}>
            어떻게 되시나요?
          </Text>
          <TextInput
            style={styles.textInput}
            autoFocus={true}
            onChangeText={(text) => setPhoneNumber(text)}
            placeholder="휴대폰 번호를 '-'없이 입력해주세요."
            keyboardType="phone-pad"
            clearTextOnFocus={true}
            value={phoneNumber}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={signUp}>
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
    marginTop: 15,
    marginBottom: 8,
    marginHorizontal: 4
  }
});

export default SignUpPhone;
