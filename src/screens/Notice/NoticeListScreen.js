import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Feather } from "@expo/vector-icons";
const DATA = [{ title: "공지 1", content: "내용 1", id: 1 }];

const NoticeListScreen = ({ navigation }) => {
  const onSearch = () => {};

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onSearch}>
          <Feather
            style={styles.searchIcon}
            name="search"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      )
    });
  }, []);
  const renderItem = ({ item }) => (
    <Item title={item.title} content={item.content} id={item.id} />
  );

  const Item = ({ title, content, id }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Notice")}
        style={styles.item}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.creationDate}>##시간 전</Text>
        <Text style={styles.content} numberOfLines={4}>
          {content}
        </Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </View>
  );
};

export default NoticeListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#fff"
  },
  itemContainer: {
    borderBottomColor: "#f3f3f3",
    borderBottomWidth: 1
  },
  item: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 16
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
  searchIcon: {
    marginRight: 20
  }
});
