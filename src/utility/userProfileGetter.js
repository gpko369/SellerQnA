import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function getUserProfile(userID) {
  try {
    const result = await API.graphql(
      graphqlOperation(queries.getUser, { id: userID })
    );
    let numberOfQuestions = result.data.getUser.question.items.length;
    let numberOfAnswers = result.data.getUser.answer.items.length;
    let numberOfChosenAnswers = 0;

    result.data.getUser.answer.items.forEach((answer) => {
      if (answer.chosen) numberOfChosenAnswers++;
    });

    if (Constants.isDevice) updateExpoPushNotificationToken(userID);

    return {
      userName: result.data.getUser.username,
      userImage: result.data.getUser.profileImageS3ObjectKey,
      introduction: result.data.getUser.introduction,
      numberOfQuestions: numberOfQuestions,
      numberOfAnswers: numberOfAnswers,
      numberOfChosenAnswers: numberOfChosenAnswers
    };
  } catch (err) {
    throw err;
  }
}

const updateExpoPushNotificationToken = async (userID) => {
  const token = await Notifications.getExpoPushTokenAsync();
  const mutaionResult = API.graphql(
    graphqlOperation(mutations.updateUser, {
      input: {
        id: userID,
        expoPushToken: token.data
      }
    })
  );
};
