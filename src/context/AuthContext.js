import React, { createContext, useState } from "react";
import { Auth } from "@aws-amplify/auth";

const AuthContext = createContext({
  user: {},
  isAuthenticated: false,
  isPhone: false,
  checkAuth: () => {},
  setUserObj: () => {},
  checkPhone: () => {},
  setPhoneBool: () => {}
});

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  const checkAuth = async (state) => {
    try {
      console.log("checking auth...");
      const user = await Auth.currentAuthenticatedUser();
      if (user.attributes.phone_number_verified || state == "social complete") {
        setPhoneBool(true);
      } else {
        setPhoneBool(false);
      }
      setIsAuthenticated(true);
      setUserObj(user.attributes);
    } catch (err) {
      console.log(err);
      setPhoneBool(false);
      setIsAuthenticated(false);
    }
  };

  const checkPhone = async () => {
    try {
      const user0 = await Auth.currentAuthenticatedUser();
      if (user0.attributes.phone_number_verified) {
        setPhoneBool(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setUserObj = (user) => {
    setUser(user);
  };

  const setPhoneBool = (bool) => {
    setIsPhone(bool);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        checkAuth,
        user,
        setUserObj,
        checkPhone,
        isPhone,
        setPhoneBool
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
