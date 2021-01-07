import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { AntDesign } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";

import { getUserProfile } from "../utility/userProfileGetter";

const DrawerContent = props => {
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    if (user) {
      console.log(user);
      getUserProfile(user.sub)
        .then(({ userName, userImage }) => {
          setUserName(userName);
          setUserImage(userImage);
        })
        .catch(err => console.log(err));
    }
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ marginLeft: 20, marginTop: 12 }}
        onPress={() => props.navigation.closeDrawer()}
      >
        <AntDesign name="close" size={24} color="black" />
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          borderBottomColor: "#f3f3f3",
          paddingVertical: 20,
          borderBottomWidth: 1
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{userName}</Text>
        <Image source={require("../img/user.png")} style={{ width: 47, height: 47, opacity: 0.7 }} />
      </View>
      <View>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate("MyQuestion");
          }}
        >
          <AntDesign
            name="inbox"
            size={22}
            color="black"
            style={{ marginRight: 15 }}
          />
          <Text>내 보관함</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate("Setting");
          }}
        >
          <AntDesign
            name="setting"
            size={22}
            color="black"
            style={{ marginRight: 15 }}
          />
          <Text>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  drawerItem: {
    borderBottomColor: "#f3f3f3",
    borderBottomWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center"
  }
});
