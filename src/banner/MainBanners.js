import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Image
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { openChat } from "../utility/openChat";
import { Text } from "../components/CustomFontText";

const data = [
  <ImageBackground
    source={require("../img/open_chat_background.png")}
    style={{ height: 112 }}
  >
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 25
      }}
    >
      <View
        style={{
          alignItems: "center",
          marginTop: 22,
          marginBottom: 16
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
          아직도 외롭게 쇼핑몰 운영하시나요?
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 8
          }}
        >
          셀러 Q&A 오픈채팅에서 자유롭게 소통하세요.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#FEE500",
            height: 44,
            alignSelf: "stretch",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center"
          }}
          onPress={openChat}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <Image
              source={require("../img/kakao_login.png")}
              style={{ height: 32, width: 28 }}
            />
            <Text style={{ fontWeight: "bold", alignSelf: "center" }}>
              지금 바로 오픈채팅 참여하기
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>,
  <TouchableOpacity onPress={openChat}>
    <ImageBackground
      source={require("../img/open_chat_background.png")}
      style={{ height: 112 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          paddingHorizontal: 25
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
            아직도 외롭게 쇼핑몰 운영하시나요?
          </Text>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8
            }}
          >
            셀러 Q&A 오픈채팅에서 자유롭게 소통하세요.
          </Text>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>,

  <View
    style={{
      flex: 1,
      backgroundColor: "#585752",
      paddingHorizontal: 25,
      paddingVertical: 12
    }}
  >
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around"
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
        아직도 외롭게 쇼핑몰 운영하시나요?
      </Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "bold"
        }}
      >
        <Text style={{ color: "#FEE500", fontWeight: "bold" }}>
          셀러 Q&A 오픈채팅
        </Text>
        에서 자유롭게 소통하세요.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center"
        }}
        onPress={openChat}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 6
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              alignSelf: "center",
              marginRight: 4,
              fontSize: 12
            }}
          >
            지금 바로 참여하기
          </Text>
          <AntDesign name="arrowright" size={15} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  </View>
];

export const MainBanners = () => {
  return <View style={styles.container}>{data[0]}</View>;
};

export const HomeBanners = () => {
  return <View style={styles.container}>{data[1]}</View>;
};

export const QuestionBanner = () => {
  return <View style={styles.questionBannerContainer}>{data[2]}</View>;
};

const styles = StyleSheet.create({
  container: {
    height: 112,
    marginBottom: 24
  },
  questionBannerContainer: {
    height: 101
  }
});
