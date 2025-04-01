import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { currentUser, loading, logout } = useAuth();

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">User Information</h3>
        <p>
          <strong>Username:</strong> {currentUser.username}
        </p>
        {currentUser.email && (
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
        )}
        {currentUser.created_at && (
          <p>
            <strong>Account Created:</strong>{" "}
            {new Date(currentUser.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
