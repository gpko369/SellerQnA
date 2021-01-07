import { Linking } from "react-native";

export async function openChat() {
  await Linking.openURL("https://open.kakao.com/o/g4AZqmsc");
}
