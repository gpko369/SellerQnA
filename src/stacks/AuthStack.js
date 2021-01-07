import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators
} from "@react-navigation/stack";

import { Entypo } from "@expo/vector-icons";

import CustomAuthenticator from "../screens/Auth/CustomAuthenticator";
import EmailLogin from "../screens/Auth/EmailLogin";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import NewPasswordScreen from "../screens/Auth/NewPasswordScreen";
import SignUpEmail from "../screens/Auth/SignUpEmail";
import SignUpPassword from "../screens/Auth/SignUpPassword";
import SignUpPhone from "../screens/Auth/SignUpPhone";
import SignUpCode from "../screens/Auth/SignUpCode";
import TermsAgreementsScreen from "../screens/Auth/TermsAgreementsScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import SignUpCompleteScreen from "../screens/Auth/SignUpCompleteScreen";
import SignInSelectScreen from "../screens/Auth/SignInSelectScreen";
import FirstQuestionScreen from "../screens/Auth/FirstQuestionScreen";

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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
          headerTitleAlign: "left",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          headerStyle: {
            shadowRadius: 0,
            shadowOffset: {
              height: 0
            }
          }
        }}
      >
        <Stack.Screen
          name="SignInSelect"
          component={SignInSelectScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailLogin"
          component={EmailLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: "비밀번호 찾기" }}
        />
        <Stack.Screen
          name="NewPassword"
          component={NewPasswordScreen}
          options={{ title: "비밀번호 찾기" }}
        />
        {/* <Stack.Screen
          name="SignUpEmail"
          component={SignUpEmail}
          options={{ title: " " }}
        />
        <Stack.Screen
          name="SignUpPassword"
          component={SignUpPassword}
          options={{ title: " " }}
        />
        <Stack.Screen
          name="SignUpPhone"
          component={SignUpPhone}
          options={{ title: " " }}
        />
        <Stack.Screen
          name="SignUpCode"
          component={SignUpCode}
          options={{ title: " " }}
        /> */}
        <Stack.Screen
          name="TermsAgreements"
          component={TermsAgreementsScreen}
          options={{ title: "서비스 약관 동의" }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "회원 가입" }}
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

export default AuthStack;
