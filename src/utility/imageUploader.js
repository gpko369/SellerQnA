import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Permissions from "expo-permissions";
import { v4 as uuid } from "react-native-uuid";
import { Storage } from "aws-amplify";

export async function uploadImage(uri) {
  let key;
  const fileName = uuid();
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    resolve(
      Storage.put(fileName, blob, {
        level: "public"
      }).then((res) => (key = res.key))
    );
  });
}

export async function imagePicker(param) {
  const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  let key;
  if (status !== "granted") {
    Alert.alert("설정 > 사진으로 들어가서 앨범 접근을 허용해주세요.");
  } else {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        ...param
      });
      if (!result.cancelled) {
        if (result.width > 800) {
          const manipulateResult = await ImageManipulator.manipulateAsync(
            result.uri,
            [{ resize: { width: 800 } }],
            {}
          );
          return manipulateResult.uri;
        } else {
          return result.uri;
        }
      } else return null;
    } catch (err) {
      console.log(err);
    }
  }
}
