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

const SignUpEmail = ({ navigation }) => {
  const [email, setEmail] = useState("");

  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const goToNextPage = () => {
    if (validateEmail(email))
      navigation.navigate("SignUpPassword", { email: email });
    else Alert.alert("이메일을 올바르게 입력해주세요.");
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
            자주 쓰는 이메일을
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 15 }}>
            입력해주세요.
          </Text>
          <TextInput
            style={styles.textInput}
            autoFocus={true}
            onChangeText={(text) => setEmail(text)}
            placeholder="가장 많이 사용하는 이메일을 입력해주세요."
            keyboardType="email-address"
            clearTextOnFocus={true}
            value={email}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={goToNextPage}>
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

export default SignUpEmail;
