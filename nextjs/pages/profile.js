import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import styles from '../styles/Profile.module.css';

const API_URL = "http://localhost:8000"; // FastAPI Backend URL

export default function Profile() {
  const [selectedFile, setSelectedFile] = useState(null); // For file input (image)
  const [imageUrl, setImageUrl] = useState(null); // To display the image
  const [loading, setLoading] = useState(false); // For loading state
  const [userId, setUserId] = useState(null); // Store user_id
  const [previewImage, setPreviewImage] = useState(null); // To preview the new image
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Fetch the current user's ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      console.error("No user_id found in localStorage.");
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


  // Fetch the current user's profile image when the component mounts
  useEffect(() => {
    if (userId) {
      fetchProfileImage();
    }
  }, [userId]);

  // Fetch profile image from the server
  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/images/user/${userId}`);
      if (response.data && response.data.image_data) {
        setImageUrl(`data:image/jpeg;base64,${response.data.image_data}`);
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // Display preview
      setSelectedFile(file); // Set the file to be uploaded
    }
  };

  // Handle form submission to upload image
  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      setLoading(true);

      try {
        const response = await axios.post(`${API_URL}/api/images/upload/${userId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // On successful upload, update the image URL
        if (response.data && response.data.image_data) {
          setImageUrl(`data:image/jpeg;base64,${response.data.image_data}`);
          setPreviewImage(null); // Clear preview after upload
        }

        setLoading(false);
        setSelectedFile(null); // Reset the selected file
      } catch (error) {
        console.error("Error uploading profile image:", error);
        setLoading(false);
      }
    } else {
      console.error("No file selected.");
    }
  };

  return (
    <Box sx={{ textAlign: "center", padding: "20px", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Profile
      </Typography>

      {/* Profile Image */}
      <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
        {imageUrl || previewImage ? (
          <Avatar
            alt="Profile"
            src={previewImage || imageUrl}
            sx={{ width: 150, height: 150, margin: "0 auto" }}
          />
        ) : (
          <Avatar
            alt="Profile Placeholder"
            sx={{ width: 150, height: 150, margin: "0 auto", backgroundColor: '#ccc' }}
          >
            {/* Initials or Placeholder */}
          </Avatar>
        )}
      </Box>
      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        {username || "User Name"}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ marginBottom: "20px" }}>
          {email || "useremail@example.com"}
      </Typography>

      {/* Input for uploading new profile image */}
      <Button
        variant="contained"
        component="label"
        sx={{ marginBottom: '20px', backgroundColor: '#555', color: '#fff' }}
      >
        Upload New Image
        <input type="file" hidden onChange={handleImageChange} accept="image/*" />
      </Button>

      {/* Image Upload Section */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ marginLeft: "10px" }}
          disabled={!selectedFile || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
      </Box>
    </Box>
  );
}
