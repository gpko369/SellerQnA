import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Auth } from "@aws-amplify/auth";
import { Hub } from "aws-amplify";

import { AuthContext } from "../../context/AuthContext";

import { AntDesign } from "@expo/vector-icons";
import ServiceOfTerms from "../UseOfTerms/ServiceOfTerms";
import PrivacyPolicy from "../UseOfTerms/PrivacyPolicy";

const SocialSigninTermsAgreement = ({ navigation }) => {
  const { checkAuth } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceOfTermsVisible, setServiceOfTermsVisible] = useState(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);

  const onAgreeAll = () => {
    setAgreeAll((prev) => {
      if (prev) {
        setAgree1(false);
        setAgree2(false);
        setAgree3(false);
      } else {
        setAgree1(true);
        setAgree2(true);
        setAgree3(true);
      }
      return !prev;
    });
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      Alert.alert(error);
    }
  };

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signOut":
          console.log(event);
          console.log(data);
          checkAuth();
      }
    });
    return () => {
      Hub.remove("auth");
    };
  }, []);

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

  useEffect(() => {
    if (agree1 !== true || agree2 !== true || agree3 !== true)
      setAgreeAll(false);
    else if (agree1 === true && agree2 === true && agree3 === true)
      setAgreeAll(true);
  }, [agree1, agree2, agree3]);

  const goToRegistrationScreen = () => {
    if (agreeAll) navigation.navigate("SMSVerify");
    else Alert.alert("필수 사항에 동의해주세요.");
  };

  const TermsModal = () => (
    <Modal transparent={true} visible={modalVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <ScrollView style={{ height: 320 }}>
            {serviceOfTermsVisible && <ServiceOfTerms />}
            {privacyPolicyVisible && <PrivacyPolicy />}
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setServiceOfTermsVisible(false);
              setPrivacyPolicyVisible(false);
            }}
            style={{ alignSelf: "center", marginTop: 16 }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#FF6F4A" }}
            >
              닫기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <TermsModal />
      <View style={{ flex: 1 }}>
        <View
          style={{ ...styles.agreementContainer, justifyContent: "flex-start" }}
        >
          <TouchableOpacity
            style={{ width: 24, height: 24, marginRight: 16 }}
            onPress={onAgreeAll}
          >
            {agreeAll === false && <View style={styles.checkCircle} />}
            {agreeAll === true && (
              <AntDesign name="checkcircle" size={24} color="#FF6F4A" />
            )}
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            모두 동의합니다.
          </Text>
        </View>
        <View style={styles.agreementContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{ width: 24, height: 24, marginRight: 16 }}
              onPress={() => setAgree1((prev) => !prev)}
            >
              {agree1 === false && <View style={styles.checkCircle} />}
              {agree1 === true && (
                <AntDesign name="checkcircle" size={24} color="#FF6F4A" />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 16 }}>서비스 이용 약관 동의</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setServiceOfTermsVisible(true);
            }}
          >
            <Text style={{ fontSize: 12, textDecorationLine: "underline" }}>
              전문보기
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.agreementContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{ width: 24, height: 24, marginRight: 16 }}
              onPress={() => setAgree2((prev) => !prev)}
            >
              {agree2 === false && <View style={styles.checkCircle} />}
              {agree2 === true && (
                <AntDesign name="checkcircle" size={24} color="#FF6F4A" />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 16 }}>개인정보 이용 및 처리방침 동의</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
              setPrivacyPolicyVisible(true);
            }}
          >
            <Text style={{ fontSize: 12, textDecorationLine: "underline" }}>
              전문보기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={goToRegistrationScreen}
        style={styles.nextButton}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
          다음
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SocialSigninTermsAgreement;

const styles = StyleSheet.create({
  agreementContainer: {
    flexDirection: "row",
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(243,243,243,0.5)",
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "space-between"
  },
  checkCircle: {
    borderWidth: 1,
    borderColor: "#C4C4C4",
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16
  },
  nextButton: {
    height: 80,
    backgroundColor: "#FF6F4A",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: 325,
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 20
  }
});
