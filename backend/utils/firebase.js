require("dotenv").config();

const firebaseApiKey = process.env.FIREBASE_API_KEY || "AIzaSyBdy7TepFl60VgaJ7ovFK1JkXZ_VnaU2nQ";
const firebaseBaseUrl = "https://identitytoolkit.googleapis.com/v1/accounts";

const firebaseRequest = async (endpoint, body) => {
  const response = await fetch(`${firebaseBaseUrl}:${endpoint}?key=${firebaseApiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || "Firebase authentication failed");
    error.code = data?.error?.message;
    throw error;
  }

  return data;
};

exports.createFirebaseUser = async (email, password) => {
  return firebaseRequest("signUp", {
    email,
    password,
    returnSecureToken: true
  });
};

exports.loginFirebaseUser = async (email, password) => {
  return firebaseRequest("signInWithPassword", {
    email,
    password,
    returnSecureToken: true
  });
};

exports.verifyFirebaseIdToken = async (idToken) => {
  const data = await firebaseRequest("lookup", {
    idToken
  });

  return data.users?.[0];
};

exports.firebaseErrorMessage = (code) => {
  const messages = {
    EMAIL_EXISTS: "User already exist",
    EMAIL_NOT_FOUND: "No Data Found. SignUp First",
    INVALID_PASSWORD: "password in incorrect",
    INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect",
    WEAK_PASSWORD: "Password should be at least 6 characters",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Try again later"
  };

  return messages[code] || "Firebase authentication failed";
};
