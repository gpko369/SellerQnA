import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { LinearGradient } from "expo-linear-gradient";
import { Auth } from "@aws-amplify/auth";
import { AuthContext } from "../../context/AuthContext";

const SMSRequest = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUserObj({});
      checkAuth();
    } catch (error) {
      Alert.alert(error);
    }
  };

  const onPressSMSRequest = async () => {
    try {
      const user0 = await Auth.currentAuthenticatedUser();
      if (!user0.attributes.phone_number) {
        await Auth.updateUserAttributes(user0, {
          phone_number: "+82" + phoneNumber
        });
      } else {
        await Auth.verifyCurrentUserAttribute("phone_number");
      }
      navigation.navigate("SMSVerify");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={signOut}>
            <Text
              style={{
                color: "rgb(133,133,133)",
                fontWeight: "bold",
                paddingRight: 20,
                fontSize: 14
              }}
            >
              나가기
            </Text>
          </TouchableOpacity>
        );
      }
    });
  }, []);

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
          <Text style={{ fontSize: 28, fontWeight: "800" }}>
            어떻게 되시나요?
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => setPhoneNumber(text)}
            placeholder="휴대전화번호를 - 없이 입력해주세요"
            autoFocus={true}
            keyboardType="phone-pad"
            value={phoneNumber}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={onPressSMSRequest}>
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
    borderColor: "rgb(53,53,53)",
    borderBottomWidth: 0.5,
    backgroundColor: "white",
    paddingHorizontal: 0,
    borderRadius: 3,
    marginTop: 15,
    marginBottom: 8,
    marginHorizontal: 4
  }
});

export default SMSRequest;
