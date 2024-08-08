import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {ENV_CONFIG} from "../consts/env-config.const";

export const userDocumentDelete = functions
  .region(ENV_CONFIG.region)
  .firestore
  .document(`users/{documentId}`)
  .onDelete(async (snap, context) => {
    const user = snap.data();
    const uid = context.params.documentId;

    if (!user) {
      return;
    }

    try {
      await admin.auth().deleteUser(uid);
    } catch (e) {
      functions.logger.error(e);
    }
  });
