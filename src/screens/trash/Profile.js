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

import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import { fn_dateTimeToFormatted } from "../utility/utilFunctions";

import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import * as subscriptions from "../graphql/subscriptions";

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      phone
      question {
        items {
          id
          content
          createdAt
          updatedAt
          user {
            id
            username
          }
          childQuestion {
            items {
              id
              content
            }
          }
        }
        nextToken
      }
      idea {
        items {
          id
          content
          createdAt
          updatedAt
        }
        nextToken
      }
      board {
        items {
          id
          title
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const Profile = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUserObj({});
      checkAuth();
    } catch (error) {
      Alert.alert(error);
    }
  };

  const getProfile = async () => {
    try {
      const getUserData = await API.graphql(
        graphqlOperation(getUser, { id: user.sub })
      );
      setUserProfile(getUserData.data.getUser);
    } catch (err) {
      console.log(err);
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

  if (userProfile)
    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            borderBottomWidth: 6,
            borderBottomColor: "rgb(246,246,246)"
          }}
        >
          <View style={styles.paddingContainer}>
            <View style={styles.container_1}>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      justifyContent: "center",
                      flex: 1
                    }}
                  >
                    <Text style={{ fontSize: 26, fontWeight: "bold" }}>
                      {userProfile.username}
                    </Text>
                    <Text style={{ opacity: 0.5 }}>{userProfile.email}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Image
                      source={require("../img/sampleProfile.png")}
                      style={{
                        width: 68,
                        height: 68,
                        resizeMode: "contain",
                        alignSelf: "flex-end"
                      }}
                    />
                  </View>
                </View>
                <View style={{ paddingVertical: 20 }}>
                  <Text>
                    여기에는 간단한 자기소개가 들어갈겁니다.
                    으아아아아아아아아아아아
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ flex: 2 }}>
          <View
            style={{
              borderBottomColor: "rgb(246,246,246)",
              borderBottomWidth: 1,
              marginBottom: 20
            }}
          >
            <Text
              style={{
                paddingHorizontal: 25,
                fontWeight: "bold",
                fontSize: 18,
                paddingVertical: 15,
                marginTop: 10
              }}
            >
              내 포스트
            </Text>
          </View>
          <View style={styles.paddingFlatListContainer}>
            <FlatList
              style={{ flex: 1 }}
              data={userProfile.question.items}
              renderItem={questionComponent}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </View>
    );
  else return null;
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
  paddingFlatListContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 25,
    paddingLeft: 10,
    alignItems: "stretch"
  },
  container_1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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

export default Profile;
