import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { S3Image } from "../../components/CustomImage";

import { Text, TextInput } from "../../components/CustomFontText";
import { API, graphqlOperation } from "aws-amplify";

import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import { AuthContext } from "../../context/AuthContext";
import { getUserProfile } from "../../utility/userProfileGetter";
import { imagePicker, uploadImage } from "../../utility/imageUploader";

import { AntDesign } from "@expo/vector-icons";

const ProfileEditScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [isChangingImage, setIsChangingImage] = useState(false);
  const { user } = useContext(AuthContext);

  const getProfile = async () => {
    try {
      const profile = await getUserProfile(user.sub);
      setProfileImage(profile.userImage);
      setUserName(profile.userName);
      setIntroduction(profile.introduction);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  const changeProfileImage = async () => {
    try {
      const uri = await imagePicker({ allowsEditing: true, aspect: [1, 1] });
      if (uri) {
        setImageUri(uri);
        setIsChangingImage(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveProfile = async () => {
    try {
      let key;
      if (isChangingImage) {
        key = await uploadImage(imageUri);
      }
      await API.graphql(
        graphqlOperation(mutations.updateUser, {
          input: {
            id: user.sub,
            introduction: introduction,
            username: userName,
            ...(isChangingImage ? { profileImageS3ObjectKey: key } : {})
          }
        })
      );
      Alert.alert(
        "성공적으로 프로필을 수정하였습니다.",
        "",
        [
          {
            text: "확인",
            onPress: () => navigation.pop()
          }
        ],
        { cancelable: false }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <SafeAreaView />
        <View style={styles.paddingContainer}>
          <TouchableOpacity
            style={{ marginTop: 30 }}
            onPress={changeProfileImage}
          >
            <View>
              <View
                style={{
                  position: "absolute",
                  zIndex: 100,
                  backgroundColor: "rgba(256,256,256,0.8)",
                  borderRadius: 15,
                  left: 50
                }}
              >
                <AntDesign name="setting" size={24} color="#000000" />
              </View>

              {!isChangingImage && (
                <S3Image
                  imgKey={profileImage}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    marginBottom: 27
                  }}
                />
              )}
              {isChangingImage && (
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    marginBottom: 27
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>닉네임</Text>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 24,
              justifyContent: "space-between"
            }}
          >
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  height: 45,
                  borderWidth: 1,
                  backgroundColor: "#FAFAFA",
                  borderRadius: 5,
                  borderColor: "rgba(53,53,53,0.5)",
                  paddingHorizontal: 20
                }}
                onChangeText={(text) => setUserName(text)}
                value={userName}
              />
            </View>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              상태메시지
            </Text>
            <Text style={{ opacity: 0.5 }}>
              {introduction ? introduction.length : "0"}/90
            </Text>
          </View>
          <TextInput
            style={{
              height: 75,
              borderWidth: 1,
              backgroundColor: "#FAFAFA",
              borderRadius: 5,
              borderColor: "rgba(53,53,53,0.5)",
              padding: 20
            }}
            value={introduction}
            onChangeText={(text) => {
              if (text.length <= 90) setIntroduction(text);
            }}
            multiline={true}
          />
        </View>
        <TouchableOpacity
          onPress={saveProfile}
          style={{
            backgroundColor: "#FF6F4A",
            height: 76,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 10
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            프로필 저장
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProfileEditScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  paddingContainer: {
    paddingHorizontal: 25,
    flex: 1
  }
});
