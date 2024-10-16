import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import { styled } from "@mui/system";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const API_URL = "http://localhost:8000"; // FastAPI Backend URL

// Styled components
const ProfileImage = styled(Box)({
  width: "150px",
  height: "150px",
  backgroundColor: "#e0e0e0",
  borderRadius: "50%",
  marginBottom: "20px",
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
});

const IconOverlay = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  opacity: 0,
  transition: "opacity 0.3s ease",
  color: "rgba(0, 0, 0, 0.7)",
  "&:hover": {
    opacity: 1,
  },
});

const FileInput = styled("input")({
  display: "none",
});

export default function Profile() {
  const [profileImage, setProfileImage] = useState("/default-avatar.png"); // Default avatar
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(parseInt(storedUserId)); // Set userId as integer
      fetchProfileImage(parseInt(storedUserId)); // Fetch profile image
    }
  }, []);

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

  // Fetch the user's profile image
  const fetchProfileImage = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/images/get-image/${userId}`, {
        responseType: "blob", // Expect blob for image data
      });

      const imageURL = URL.createObjectURL(response.data);
      setProfileImage(imageURL); // Set the profile image
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(`${API_URL}/images/upload-image/${userId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          const imageURL = URL.createObjectURL(file);
          setProfileImage(imageURL);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <label htmlFor="image-upload">
        <FileInput id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
        <ProfileImage onClick={() => document.getElementById("image-upload").click()}>
          <Image src={profileImage} alt="Profile" fill style={{ objectFit: "cover" }} />
          <IconOverlay>
            <CameraAltIcon sx={{ fontSize: 30 }} />
          </IconOverlay>
        </ProfileImage>
      </label>

      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        {username || "User Name"}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ marginBottom: "20px" }}>
          {email || "useremail@example.com"}
        </Typography>
    </Box>
  );
}
