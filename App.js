import React, { useEffect, useState, useContext, createContext } from "react";
import "react-native-gesture-handler";
import Amplify from "@aws-amplify/core";
import { Auth } from "@aws-amplify/auth";
import config from "./aws-exports";
import { withAuthenticator } from "aws-amplify-react-native";
import { StatusBar } from "react-native";
import AppProvider from "./src/utility/AppProvider";
import { AuthContext, AuthContextProvider } from "./src/context/AuthContext";
import { AppLoading } from "expo";
import * as Linking from "expo-linking";
import * as Font from "expo-font";
import * as WebBrowser from "expo-web-browser";
import * as Amplitude from "expo-analytics-amplitude";

const urlOpener = async (url, redirectUrl) => {
  // On Expo, use WebBrowser.openAuthSessionAsync to open the Hosted UI pages.
  const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(
    url,
    redirectUrl
  );

  if (type === "success") {
    await WebBrowser.dismissBrowser();

    if (Platform.OS === "ios") {
      return Linking.openURL(newUrl);
    }
  }
};

const oauth = {
  ...config.oauth,
  redirectSignIn: "sellerqna://",
  redirectSignOut: "sellerqna://",
  responseType: "code",
  urlOpener: urlOpener
};

config.oauth = oauth;

Amplify.configure(config);
Amplitude.initialize("70ccf26eb52d0a0d0ebdd68d52d17b46");

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFont = async () => {
    await Font.loadAsync({
      SourceSansPro: require("./assets/fonts/SourceSansPro-Regular.ttf"),
      SourceSansProB: require("./assets/fonts/SourceSansPro-Bold.ttf"),
      SourceSansProL: require("./assets/fonts/SourceSansPro-Light.ttf"),
      SourceSansProSB: require("./assets/fonts/SourceSansPro-SemiBold.ttf")
    });
    setFontLoaded(true);
  };

  useEffect(() => {
    loadFont();
    return () => {
      setLoading(false);
    };
  }, []);

  if (fontLoaded) {
    return (
      <AuthContextProvider>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <AppProvider />
      </AuthContextProvider>
    );
  } else return <AppLoading />;
};

export default App;
