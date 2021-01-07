import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Text } from "../../components/CustomFontText";
import { API, graphqlOperation } from "aws-amplify";

import { AuthContext } from "../../context/AuthContext";
import { fn_dateTimeToFormatted } from "../../utility/utilFunctions";
import { S3Image } from "../../components/CustomImage";

import * as mutations from "../../graphql/mutations";
import * as subscriptions from "../../graphql/subscriptions";
import * as Linking from "expo-linking";

const getUnreadAlertsQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      alerts(sortDirection: DESC, filter: { read: { eq: false } }) {
        items {
          id
          targetUserID
          alertType
          message
          imageKey
          path
          queryParameter
          read
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const getReadAlertsQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      alerts(sortDirection: DESC, filter: { read: { eq: true } }) {
        items {
          id
          targetUserID
          alertType
          message
          imageKey
          path
          queryParameter
          read
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const AlertScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // useEffect(() => {
  //   getUnreadAlerts();
  //   const subscribeOnCreateAlert = API.graphql(
  //     graphqlOperation(subscriptions.onCreateAlert)
  //   ).subscribe({
  //     next: (data) => {
  //       console.log(data);
  //       getUnreadAlerts();
  //     }
  //   });

  //   const subscribeOnDeleteAlert = API.graphql(
  //     graphqlOperation(subscriptions.onDeleteAlert)
  //   ).subscribe({
  //     next: () => getUnreadAlerts()
  //   });

  //   const subscribeOnUpdateAlert = API.graphql(
  //     graphqlOperation(subscriptions.onUpdateAlert)
  //   ).subscribe({
  //     next: () => getUnreadAlerts()
  //   });

  //   return () => {
  //     subscribeOnCreateAlert.unsubscribe();
  //     subscribeOnDeleteAlert.unsubscribe();
  //     subscribeOnUpdateAlert.unsubscribe();
  //   };
  // }, []);

  const UnreadAlertItems = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const getUnreadAlerts = async () => {
      const result = await API.graphql(
        graphqlOperation(getUnreadAlertsQuery, {
          id: user.sub
        })
      );
      setItems(result.data.getUser.alerts.items);
    };
    // useEffect(() => {
    //   const unsubscribeFocus = navigation.addListener("focus", (e) => {
    //     getUnreadAlerts()
    //       .then(() => setLoading(false))
    //       .catch((err) => console.log(err));
    //   });

    //   return unsubscribeFocus;
    // }, [navigation]);

    useEffect(() => {
      const unsubscribeFocus = navigation.addListener("focus", (e) => {
        getUnreadAlerts()
          .then(() => setLoading(false))
          .catch((err) => console.log(err));
      });

      return unsubscribeFocus;
    }, [navigation]);

    const RenderItem = useCallback(({ item }) => {
      const url = Linking.makeUrl(item.path + "/" + item.queryParameter);

      const onPressHandler = () => {
        API.graphql(
          graphqlOperation(mutations.updateAlert, {
            input: { id: item.id, read: true }
          })
        );

        Linking.openURL(url);
      };

      return (
        <View style={{ height: 74 }}>
          <View
            style={{
              ...styles.paddingContainer,
              backgroundColor: "#FFFCF5",
              flex: 1,
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={onPressHandler}
            >
              <S3Image
                imgKey={item.imageKey}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 14
                }}
              />
              <View style={{ flex: 1 }}>
                <Text>
                  {item.message + "  "}
                  <Text style={{ fontSize: 14, opacity: 0.5 }}>
                    {fn_dateTimeToFormatted(item.createdAt)}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }, []);

    return items.length ? (
      <View>
        <View style={styles.paddingContainer}>
          <Text style={{ fontWeight: "bold" }}>최신</Text>
        </View>
        {items.map((item) => (
          <RenderItem item={item} key={item.id} />
        ))}
        <View
          style={{ borderWidth: 1, borderColor: "#F2F2F2", marginBottom: 16 }}
        />
      </View>
    ) : null;
  };
  const ReadAlertItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUnreadAlerts = async () => {
      const result = await API.graphql(
        graphqlOperation(getReadAlertsQuery, {
          id: user.sub
        })
      );
      setItems(result.data.getUser.alerts.items);
    };

    useEffect(() => {
      const unsubscribeFocus = navigation.addListener("focus", (e) => {
        getUnreadAlerts()
          .then(() => setLoading(false))
          .catch((err) => console.log(err));
      });

      return unsubscribeFocus;
    }, [navigation]);

    const RenderItem = useCallback(({ item }) => {
      const url = Linking.makeUrl(item.path + "/" + item.queryParameter);

      const onPressHandler = () => {
        API.graphql(
          graphqlOperation(mutations.updateAlert, {
            input: { id: item.id, read: true }
          })
        );

        Linking.openURL(url);
      };

      return (
        <View style={{ height: 74, opacity: 0.7 }}>
          <View
            style={{
              ...styles.paddingContainer,
              flex: 1,
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={onPressHandler}
            >
              <S3Image
                imgKey={item.imageKey}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 14
                }}
              />
              <View style={{ flex: 1 }}>
                <Text>
                  {item.message + "  "}
                  <Text style={{ fontSize: 14, opacity: 0.5 }}>
                    {fn_dateTimeToFormatted(item.createdAt)}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }, []);

    return (
      <View>
        {items.map((item) => (
          <RenderItem item={item} key={item.id} />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView />
      <View
        style={{ ...styles.paddingContainer, marginTop: 40, marginBottom: 40 }}
      >
        <Text style={{ fontSize: 24, fontWeight: "600" }}>알림</Text>
      </View>
      <ScrollView>
        <UnreadAlertItems />
        <ReadAlertItems />
      </ScrollView>
      <SafeAreaView />
    </View>
  );
};

export default AlertScreen;

const styles = StyleSheet.create({
  paddingContainer: {
    paddingHorizontal: 25
  }
});
