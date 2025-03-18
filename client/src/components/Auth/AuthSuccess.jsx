import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import { parseTokenFromUrl } from "../../utils/storageManager";
import { setCredentials, getCurrentUser } from "../../redux/slices/authSlice";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Check if token is in URL (for local/session storage)
        const token = parseTokenFromUrl();

        if (token) {
          // Get storage type from localStorage
          const storageType = localStorage.getItem("storageType") || "local";

          // Store token in appropriate storage
          if (storageType === "local") {
            localStorage.setItem("token", token);
          } else if (storageType === "session") {
            sessionStorage.setItem("token", token);
          }
        }

        // Get current user data
        const result = await dispatch(getCurrentUser()).unwrap();

        // Set user in Redux store
        if (result && result.data) {
          dispatch(setCredentials({ user: result.data }));
        }

        // Check if we have an SSO redirect URL
        const ssoRedirectUrl = sessionStorage.getItem("ssoRedirectUrl");
        if (ssoRedirectUrl) {
          // Clear the stored redirect URL
          sessionStorage.removeItem("ssoRedirectUrl");
          // Redirect to the target URL
          navigate(ssoRedirectUrl);
        } else {
          // Default redirect to dashboard
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/login", {
          state: {
            error: "Authentication failed. Please try again.",
          },
        });
      }
    };

    handleAuthSuccess();
  }, [dispatch, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        Authentication Successful
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Please wait while we redirect you...
      </Typography>
    </Box>
  );
};

export default AuthSuccess;
