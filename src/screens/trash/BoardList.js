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
  Modal
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { API, graphqlOperation } from "aws-amplify";

import { AuthContext } from "../../context/AuthContext";

import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
import * as subscriptions from "../../graphql/subscriptions";

const BoardList = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    checkAuth,
    setUserObj,
    checkPhone,
    isPhone
  } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

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
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>새 보드 생성</Text>
            <TouchableOpacity
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.textStyle}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.paddingContainer}>
        <View style={styles.container_1}>
          <View>
            <Text style={styles.hookText}>보드가 있으신가요?</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <LinearGradient
                  colors={["rgb(235,76,42)", "rgb(237,18,94)"]}
                  style={styles.gradientButton}
                  start={[1, -0.5]}
                  end={[-0.5, 1]}
                />
                <Text style={styles.buttonText}>생성</Text>
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
  modalView: {
    margin: 25,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 25,
    height: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "rgba(151,151,151,0.3)",
    marginTop: 22
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

export default BoardList;
