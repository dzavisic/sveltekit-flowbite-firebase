import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {ENV_CONFIG} from "../consts/env-config.const";

export const createUser = functions
  .region(ENV_CONFIG.region)
  .https
  .onCall(async (data) => {
    const {email, password} = data;

    if ([email, password].some((value) => !value)) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    let user: admin.auth.UserRecord;

    try {
      /*
       * Create user in Firebase Authentication service
       */
      user = await admin.auth().createUser(data);

      /*
        * Set custom claims for rules purposes on user
        * TODO: Adjust the role as needed with client and passed data
       */
      await admin.auth().setCustomUserClaims(user.uid, {
        role: "admin"
      });

      /*
       * Create user in Firestore database
       */
      await admin.firestore().collection("users").doc(user.uid).set({
        createdOn: Date.now(),
        email
      });
    } catch (error) {
      functions.logger.error(error);
      throw new functions.https.HttpsError("internal", (error as any).toString());
    }

    return {
      id: user.uid
    };
  });