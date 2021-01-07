import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Entypo } from "@expo/vector-icons";

import SMSRequest from "../screens/Auth/SMSRequest";
import SMSVerify from "../screens/Auth/SMSVerify";
import SocialSignInTermsAgreement from "../screens/Auth/SocialSignInTermsAgreement";
import SignUpCompleteScreen from "../screens/Auth/SignUpCompleteScreen";
import FirstQuestionScreen from "../screens/Auth/FirstQuestionScreen";

const Stack = createStackNavigator();

const SMSVerificationStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            shadowOpacity: 0
          },

          headerTintColor: "black",
          headerBackImage: () => (
            <Entypo
              name="chevron-thin-left"
              size={22}
              style={{ marginLeft: 15 }}
              color="black"
            />
          ),
          headerBackTitleVisible: false,
          headerStyle: {
            shadowRadius: 0,
            shadowOffset: {
              height: 0
            }
          }
        }}
      >
        <Stack.Screen
          name="SocialSignInTermsAgreement"
          component={SocialSignInTermsAgreement}
          options={{ title: "서비스 약관 동의" }}
        />
        <Stack.Screen
          name="SMSVerify"
          component={SMSVerify}
          options={{
            title: "인증",
            headerTitleAlign: "left",
            headerTitleStyle: { fontSize: 20, fontWeight: "bold" }
          }}
        />
        <Stack.Screen
          name="SignUpComplete"
          component={SignUpCompleteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="FirstQuestion" component={FirstQuestionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default SMSVerificationStack;
