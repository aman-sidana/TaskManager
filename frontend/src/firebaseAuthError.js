const firebaseAuthMessages = {
    "auth/configuration-not-found": "Firebase Auth is not configured. Enable Authentication and Google sign-in for this Firebase project.",
    "auth/operation-not-allowed": "Enable Google sign-in in Firebase Authentication.",
    "auth/unauthorized-domain": "Add this domain in Firebase Authentication authorized domains.",
    "auth/popup-closed-by-user": "Google sign-in was closed before completing.",
    "auth/popup-blocked": "Browser blocked the Google sign-in popup.",
    "auth/cancelled-popup-request": "Only one Google sign-in popup can be open at a time.",
    "auth/api-key-not-valid": "Firebase API key is not valid for this project.",
    "auth/network-request-failed": "Network error while connecting to Firebase."
};

export default function firebaseAuthError(error, fallback) {
    return firebaseAuthMessages[error?.code] || error?.message || fallback;
}
