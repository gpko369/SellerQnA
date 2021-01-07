import React, { useEffect, useContext, useState } from "react";
import HomeStack from "../stacks/HomeStack";
import SMSVerificationStack from "../stacks/SMSVerificationStack";
import AuthStack from "../stacks/AuthStack";
import { AuthContext, AuthContextProvider } from "../context/AuthContext";
import LottieView from "lottie-react-native";

import { SafeAreaView, View } from "react-native";

const AppProvider = () => {
  const { user, isAuthenticated, checkAuth, isPhone, checkPhone } = useContext(
    AuthContext
  );

  const [userLoading, setUserLoading] = useState(true);

  const checkCurrentUser = async () => {
    await checkAuth();
    setUserLoading(false);
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  if (userLoading) {
    return (
      // <LottieView
      //   autoPlay={true}
      //   style={{
      //     width: "50%",
      //     backgroundColor: "#fff",
      //     justifyContent: "center",
      //     alignSelf: "center",
      //     top: "32%"
      //   }}
      //   source={require("../img/loading.json")}
      //   // OR find more Lottie files @ https://lottiefiles.com/featured
      //   // Just click the one you like, place that file in the 'assets' folder to the left, and replace the above 'require' statement
      // />
      null
    );
  } else {
    if (isAuthenticated) {
      if (isPhone) {
        return (
          <View style={{ flex: 1 }}>
            <HomeStack />
          </View>
        );
      } else {
        return (
          <View style={{ flex: 1 }}>
            <SafeAreaView />
            <SMSVerificationStack />
          </View>
        );
      }
    } else {
      return (
        <View style={{ flex: 1 }}>
          <SafeAreaView />
          <AuthStack />
        </View>
      );
    }
  }
};

export default AppProvider;
