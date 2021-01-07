import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";

import { AuthContext } from "../context/AuthContext";

import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import * as subscriptions from "../graphql/subscriptions";

const Home3 = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);

  useEffect(() => {}, []);

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUserObj({});
      checkAuth();
    } catch (error) {
      Alert.alert(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.paddingContainer}>
        <View style={styles.container_1}>
          <View>
            <Text style={styles.hookText}>무슨 일이 있었을까요?</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={styles.signOutButton}>
                <LinearGradient
                  colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
                  style={styles.gradientButton}
                  start={[1, -0.5]}
                  end={[-0.5, 1]}
                />
                <Text style={styles.buttonText}>알림</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
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
    justifyContent: "center",
    paddingHorizontal: 25,
    alignItems: "stretch"
  },
  topQuestion: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 30,
    borderBottomWidth: 0.5,
    borderColor: "rgb(198,198,198)",
    alignItems: "stretch"
  },
  button: {
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.65,

    elevation: 6
  },
  signOutButton: {
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    alignSelf: "stretch",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.65,

    elevation: 6
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    padding: 13,
    fontWeight: "bold"
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%"
  },
  gradientButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 20
  },
  container_8: {
    flex: 10
  },
  container_1: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  anyQuestionImage: {
    height: "30%",
    resizeMode: "contain"
  },
  hookText: {
    paddingVertical: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#43EFA3"
  },
  questionText: {},
  questionTextContainer: {
    flex: 1
  },
  quetionsButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  horizontalButton: {
    flexDirection: "row"
  },
  halfButtonContainer: {
    flex: 1
  }
});

export default Home3;
