import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
  ),
});

async function checkLoggedin(req, res, next) {
  const authHeader = req.headers.authorization;

  let idToken = null;
  if (authHeader?.startsWith("Bearer ")) {
    idToken = authHeader.split("Bearer ")[1]?.trim();
  }

  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken; 
    } catch (error) {
      console.warn("Token verification failed, proceeding without user:", error.message);
    }
  } else {
    console.log("No Authorization header, proceeding without user.");
  }

  next(); 

}

export { checkLoggedin };
