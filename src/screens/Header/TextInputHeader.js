import React from "react";
import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import { Text, TextInput } from "../../components/CustomFontText";

import { Feather, AntDesign, Entypo } from "@expo/vector-icons";

const TextInputHeader = ({
  inputText,
  setInputText,
  isSearch = false,
  onSearch,
  goBack,
  placeholder = ""
}) => {
  return (
    <View>
      <View style={styles.searchSection}>
        <TouchableOpacity onPress={goBack}>
          <Entypo
            name="chevron-thin-left"
            size={22}
            style={{ marginLeft: 15 }}
            color="black"
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <TextInput
            style={{
              fontSize: 20,
              fontWeight: "600"
            }}
            value={inputText}
            autoFocus={true}
            onChangeText={(text) => setInputText(text)}
            placeholder={placeholder}
          />
        </View>
        {isSearch === true && (
          <TouchableOpacity onPress={onSearch}>
            <Feather
              style={styles.searchIcon}
              name="search"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TextInputHeader;

const styles = StyleSheet.create({
  searchSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 60,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  backIcon: {
    marginLeft: 20
  },
  searchIcon: {
    marginRight: 20
  }
});
