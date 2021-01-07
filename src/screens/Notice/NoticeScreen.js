import React, { useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { FontAwesome } from "@expo/vector-icons";

const NoticeScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({ headerTitle: "" });
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.paddingContainer}>
          <Text style={styles.title}>쇼핑몰 사업이 무엇인가요?</Text>
          <Text style={styles.creationDate}>##시간 전</Text>
          <Text style={styles.content}>내용</Text>
        </View>
        <View>
          <View style={styles.modal}>
            <View>
              <Text>공지사항에 궁금한 것이 있으신가요?</Text>
            </View>
            <TouchableOpacity
              style={styles.quetionsMarkBox}
              onPress={() => navigation.navigate("FAQ")}
            >
              <FontAwesome name="question" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default NoticeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  paddingContainer: {
    paddingHorizontal: 25,
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6
  },
  creationDate: {
    fontSize: 10,
    marginBottom: 14
  },
  content: {
    fontSize: 14
  },
  modal: {
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "rgba(0,0,0,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 96,
    paddingHorizontal: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  quetionsMarkBox: { padding: 10, backgroundColor: "#FF6F4B", borderRadius: 5 }
});
