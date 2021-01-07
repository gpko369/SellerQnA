import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";
import base64 from "base-64";

export function fn_dateTimeToFormatted(value) {
  const today = new Date();
  const timeValue = new Date(value - 32400000);

  const betweenTime = Math.floor(
    (today.getTime() - timeValue.getTime()) / 1000 / 60
  );
  if (betweenTime < 1) return "방금 전";
  if (betweenTime < 60) {
    return betweenTime + "분 전";
  }

  const betweenTimeHour = Math.floor(betweenTime / 60);
  if (betweenTimeHour < 24) {
    return betweenTimeHour + "시간 전";
  }

  const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
  if (betweenTimeDay < 365) {
    return betweenTimeDay + "일 전";
  }

  return Math.floor(betweenTimeDay / 365) + "년 전";
}

export function validatePassword(password) {
  const re = /^(?=.*\d)(?=.*[!@#$?%^&*])(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%?^&*]{8,30}$/;
  return re.test(String(password));
}

export function validatePhone(number) {
  const re = /^(?=.*\d)[0-9]{0,13}$/;
  return re.test(String(number));
}

export function createNaverAPISignature(method, url, key) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  function btoa(input) {
    let str = input;
    let output = "";

    for (
      let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || ((map = "="), i % 1);
      output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      charCode = str.charCodeAt((i += 3 / 4));

      if (charCode > 0xff) {
        throw new Error(
          "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
        );
      }

      block = (block << 8) | charCode;
    }

    return output;
  }

  function hexToBase64(str) {
    return btoa(
      String.fromCharCode.apply(
        null,
        str
          .replace(/\r|\n/g, "")
          .replace(/([\da-fA-F]{2}) ?/g, "0x$1 ")
          .replace(/ +$/, "")
          .split(" ")
      )
    );
  }

  JSHmac(
    Date.now() + "." + method + "." + url,
    key,
    CONSTANTS.HmacAlgorithms.HmacSHA256
  )
    .then((hash) => {
      return hexToBase64(hash);
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
}
