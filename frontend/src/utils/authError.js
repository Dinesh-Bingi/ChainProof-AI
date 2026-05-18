export function getAuthErrorMessage(err, fallback = "Something went wrong") {
  if (!err.response) {
    if (err.code === "auth/popup-closed-by-user") return "Sign-in was cancelled";
    if (err.code === "auth/network-request-failed") {
      return "Cannot reach the server. Start the API (npm run dev) and ensure MongoDB is running or set DEV_MEMORY_DB_FALLBACK=true in .env";
    }
    if (err.message?.includes("Firebase is not configured")) return err.message;
    return "Backend is offline. Restart npm run dev and check the terminal for MongoDB errors (Atlas IP whitelist or enable DEV_MEMORY_DB_FALLBACK=true).";
  }
  const message = err.response?.data?.message || fallback;
  if (message.includes("Firebase authentication is not configured")) {
    return "Server Firebase setup is missing. Add FIREBASE_SERVICE_ACCOUNT_PATH to .env (see Firebase Console → Service accounts → Generate new private key), then restart npm run dev.";
  }
  return message;
}
