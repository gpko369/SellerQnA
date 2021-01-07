import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  FlatList
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";

import { AuthContext } from "../context/AuthContext";
import { QuestionContext } from "../context/QuestionContext";

import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import { fn_dateTimeToFormatted } from "../utility/utilFunctions";

import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import * as subscriptions from "../graphql/subscriptions";

const Home = ({ navigation }) => {
  const [questionList, setQuestionList] = useState([]);
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);
  const { currentQuestion, setCurrentQuestionObj } = useContext(
    QuestionContext
  );

  useEffect(() => {
    setCurrentQuestionObj(null);
  }, []);

  useEffect(() => {
    getQuestionList();
    const questionCreateSubscription = API.graphql(
      graphqlOperation(subscriptions.onCreateQuestion)
    ).subscribe({
      next: () => getQuestionList()
    });

    const questionDeleteSubscription = API.graphql(
      graphqlOperation(subscriptions.onDeleteQuestion)
    ).subscribe({ next: () => getQuestionList() });
    return () => {
      questionDeleteSubscription.unsubscribe();
      questionCreateSubscription.unsubscribe();
    };
  }, []);

  const getQuestionList = async () => {
    try {
      const data = await API.graphql(graphqlOperation(queries.listQuestions));
      setQuestionList(data.data.listQuestions.items);
    } catch (err) {
      console.log(err);
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUserObj({});
      checkAuth();
    } catch (error) {
      Alert.alert(error);
    }
  };

  const questionComponent = ({ item }) => (
    <View
      style={{
        backgroundColor: "#F6F6F6",
        padding: 20,
        paddingTop: 40,
        paddingLeft: 50,
        marginVertical: 5,
        marginLeft: 30,
        borderRadius: 5
      }}
    >
      {item.user.username == "gongja" ? (
        <Image
          source={require("../img/google.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            position: "absolute",
            marginTop: 20,
            marginLeft: -25
          }}
        />
      ) : item.user.username == "홍" ? (
        <Image
          source={require("../img/facebook.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            position: "absolute",
            marginTop: 20,
            marginLeft: -25
          }}
        />
      ) : (
        <Image
          source={require("../img/sampleProfile.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            position: "absolute",
            marginTop: 20,
            marginLeft: -25
          }}
        />
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>{item.user.username}</Text>
        <Entypo
          name="dots-three-horizontal"
          size={20}
          color="black"
          style={{ marginTop: -5 }}
        />
      </View>

      <Text
        style={{
          color: "black",
          fontWeight: "bold",
          fontSize: 15,
          paddingTop: 20,
          paddingBottom: 15
        }}
      >
        {item.content}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {fn_dateTimeToFormatted(item.createdAt)}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 15
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ justifyContent: "center" }}>
            <Feather name="git-merge" size={13} color="black" />
          </View>
          <View style={{ justifyContent: "center" }}>
            <Text style={{ fontSize: 12, marginLeft: 3, fontWeight: "bold" }}>
              {item.childQuestion.items.length}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
          onPress={() =>
            navigation.navigate("Question", { questionId: item.id })
          }
        >
          <LinearGradient
            colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
            style={styles.gradientNotice}
            start={[1, -0.5]}
            end={[-0.5, 1]}
          />
          <Feather name="chevron-right" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={signOut}
        style={{
          height: 44,
          marginHorizontal: 20,
          justifyContent: "center",
          paddingHorizontal: 20,
          marginTop: 15,
          marginBottom: 10
        }}
      >
        <LinearGradient
          colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
          style={styles.gradientNotice}
          start={[1, -0.5]}
          end={[-0.5, 1]}
        />
        <Text style={{ fontWeight: "bold", fontSize: 12, color: "white" }}>
          공지란입니다.
        </Text>
      </TouchableOpacity>
      <View style={styles.paddingContainer}>
        <FlatList
          style={{ flex: 1 }}
          data={questionList}
          renderItem={questionComponent}
          keyExtractor={(item) => item.id}
        />
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
    paddingRight: 25,
    paddingLeft: 10,
    alignItems: "stretch",
    paddingBottom: 70
  },
  gradientNotice: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 7
  }
});

export default Home;
