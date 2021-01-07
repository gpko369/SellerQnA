import React from "react";
import { StyleSheet, View, SafeAreaView, FlatList } from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

const DATA = [
  { title: "title1", id: 1 },
  { title: "title2", id: 2 }
];

const FAQScreen = () => {
  const renderItem = () => {};

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.paddingContainer}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 40 }}>
            도움이 필요하시면
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
            아래로 연락주세요.
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
            Call: 02-876-3233
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
            Email: hong@mongwoo.net
          </Text>
          {/* <TouchableOpacity style={styles.button}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>
            버튼
          </Text>
        </TouchableOpacity> */}
          <FlatList
            renderItem={renderItem}
            data={DATA}
            keyExtractor={(item) => item.id}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  paddingContainer: {
    paddingHorizontal: 25
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6F4B",
    borderRadius: 5,
    paddingVertical: 16
  }
});
