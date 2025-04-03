import { useEffect, useState } from "react";
import trafficLogo from "../assets/traffic-police-logo.jpg";
import authService from "../services/authService";

const LoginPage = ({ setter }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // errors like incorrect username/password
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set Webpage Title
  useEffect(() => {
    document.title = "Traffic Buddy - Login Page";
  }, []);

  //Error handeling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate input fields
    if (username.trim() === "" || password.trim() === "") {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Login attempt");

      // If not main admin, try division login via API
      const response = await authService.login(username, password);

      if (response.success) {
        // Set local state via setter prop
        setter(true, username);

        // Store login state in localStorage
        localStorage.setItem("username", username);
        localStorage.setItem("userRole", response.role);

        if (response.division) {
          localStorage.setItem("divisionId", response.division.id);
          localStorage.setItem("divisionName", response.division.name);
        }

        // Navigate to dashboard
        console.log("Redirection");
        //navigate('/overview', { replace: true });
        window.location.href =
          username === "Admin" ? "/adminoverview" : "/overview";
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Center the login screen
    <div className="flex-1 overflow-auto relative z-10 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-bgSecondary p-8 rounded-xl shadow-lg shadow-bgPrimary border border-borderPrimary">
        <div className="text-center">
          {/* Set Login Header */}
          <div className="flex items-center justify-center mb-4">
            <img
              src={trafficLogo}
              alt="Traffic Police Logo"
              className="h-16 w-auto"
              onError={(e) =>
                (e.target.src = "https://placehold.co/64x64?text=TP")
              }
            />
          </div>
          <h2 className="text-2xl font-bold text-tBase">
            Traffic Buddy Admin Portal
          </h2>
          <p className="mt-2 text-sm text-tSecondary">
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Username InputField */}
          <div className="rounded-md -space-y-px">
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-tSecondary mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-primary appearance-none relative block w-full px-3 py-3 border border-borderPrimary placeholder-gray-500 text-tBase rounded-md focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            {/* Password InputField */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-tSecondary mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-primary appearance-none relative block w-full px-3 py-3 border border-borderPrimary placeholder-gray-500 text-tBase rounded-md focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-tBase ${
                isLoading
                  ? "bg-hovSecondary cursor-not-allowed"
                  : "bg-secondary hover:bg-hovSecondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              } transition-colors duration-150`}
            >
              {/* Text Changes to Signing in on click */}
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-tBase"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        {/* Sign In Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-tDisabled">
            Traffic Buddy Administration Portal &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
