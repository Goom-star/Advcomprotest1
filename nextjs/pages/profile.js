import * as React from "react";
import { Box, Typography, Avatar, Button, Paper } from "@mui/material";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Fetch user data from localStorage when the component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");

    // Set state with the stored user data
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", width: "300px" }}>
        <Avatar
          sx={{ width: 100, height: 100, margin: "auto" }}
          alt="User Profile"
          src="/profile-pic.jpg" // You can use a default image here or from user data
        />
        <Typography variant="h5" sx={{ marginTop: "10px" }}>
          {username || "User Name"}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ marginBottom: "20px" }}>
          {email || "useremail@example.com"}
        </Typography>
        <Button variant="contained" color="primary" fullWidth>
          Edit Profile
        </Button>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
