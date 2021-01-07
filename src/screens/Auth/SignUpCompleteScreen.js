import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { API, graphqlOperation, nav } from "aws-amplify";
import * as mutations from "../../graphql/mutations";

import { AuthContext } from "../../context/AuthContext";

import { FontAwesome, Feather } from "@expo/vector-icons";

const SignUpCompleteScreen = ({ navigation, route }) => {
  const [id, setId] = useState("");
  const [email, setEmail] = useState(route.params.userName);
  const [phone, setPhone] = useState("");
  const [userObj, setUserObj] = useState({});
  const [username, setUsername] = useState(route.params.nickname);
  const { checkAuth, setPhoneBool } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log(user.attributes);
      console.log(user.attributes.phone_number_verified);
      setUserObj(user.attributes);
    } catch (err) {
      console.log(err);
    }
  };

  const checkAuthAndPhone = () => {
    setPhoneBool(true);
    if (route.params.signInState == "social") {
      checkAuth("social complete");
    } else {
      checkAuth();
    }
  };

  const createUser = async () => {
    try {
      console.log(userObj);
      const result = await API.graphql(
        graphqlOperation(mutations.createUser, {
          input: {
            id: userObj.sub,
            email: userObj.email,
            phone: userObj.phone_number.slice(3),
            username: username,
            createdAt: Date.now() + 32400000,
            profileImageS3ObjectKey: "default_image.png"
          }
        })
      );
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userObj.sub && userObj.email && userObj.phone_number) {
      createUser();
    }
  }, [userObj]);

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("../../img/signup_complete.png")}
          style={{ width: 290, height: 124, marginBottom: 34 }}
        />
        <Text style={{ ...styles.text }}>고민이 있으신가요?</Text>
        <Text style={styles.text}>첫 질문을 올려보세요.</Text>
      </View>
      <TouchableOpacity
        onPress={!loading ? checkAuthAndPhone : null}
        style={{ alignSelf: "center", marginBottom: 18 }}
      >
        <Text style={{ textDecorationLine: "underline" }}>건너뛰기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={
          !loading
            ? () => navigation.navigate("FirstQuestion", { user: userObj })
            : null
        }
        style={styles.nextButton}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
          {"셀러 Q&A에서 질문하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpCompleteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  text: {
    fontSize: 24
  },
  nextButton: {
    height: 80,
    backgroundColor: "#FF6F4A",
    justifyContent: "center",
    alignItems: "center"
  }
});
