import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/router"; // Use router for redirection
import { Person, Visibility, VisibilityOff } from "@mui/icons-material";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const router = useRouter(); // Initialize useRouter

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // Toggle visibility of password
  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password_hash: loginPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      setSnackbarMessage("Login successful!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);

      router.push("/");
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      setSnackbarMessage("Passwords do not match");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerName,
          email: registerEmail,
          password_hash: registerPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
      setSnackbarMessage("Registration successful!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Grid container style={{ height: "100vh", backgroundColor: "#ccc" }}>
      {/* Sidebar */}
      <Grid item xs={3} style={{ backgroundColor: "#575757", padding: "20px" }}>
        <Typography variant="h2" style={{ fontSize: "200px",color: "#fff", fontWeight: "bold" }}>
          V <br /> C <br /> P
        </Typography>
      </Grid>

      {/* Main Content */}
      <Grid
        item
        xs={9}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} style={{ padding: "40px", width: "400px" }}>
          {/* Tabs for Login/Register */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="h5"
              style={{
                cursor: "pointer",
                fontWeight: isLogin ? "bold" : "normal",
                borderBottom: isLogin ? "2px solid #000" : "none",
              }}
              onClick={() => setIsLogin(true)}
            >
              Login
            </Typography>
            <Typography
              variant="h5"
              style={{
                cursor: "pointer",
                fontWeight: !isLogin ? "bold" : "normal",
                borderBottom: !isLogin ? "2px solid #000" : "none",
              }}
              onClick={() => setIsLogin(false)}
            >
              Register
            </Typography>
          </div>

          {/* Form */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} style={{ marginTop: "20px" }}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                InputProps={{
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                InputProps={{
                  style: { backgroundColor: "#f5f5f5" },
                  endAdornment: (
                    <IconButton onClick={toggleShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <Button
                variant="contained"
                type="submit"
                fullWidth
                style={{ marginTop: "20px", backgroundColor: "#000" }}
              >
                Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ marginTop: "20px" }}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                InputProps={{
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                InputProps={{
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                InputProps={{
                  style: { backgroundColor: "#f5f5f5" },
                  endAdornment: (
                    <IconButton onClick={toggleShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                InputProps={{
                  style: { backgroundColor: "#f5f5f5" },
                  endAdornment: (
                    <IconButton onClick={toggleShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <Button
                variant="contained"
                type="submit"
                fullWidth
                style={{ marginTop: "20px", backgroundColor: "#000" }}
              >
                Register
              </Button>
            </form>
          )}
        </Paper>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
