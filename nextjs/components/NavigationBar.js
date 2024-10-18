import * as React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";
import PersonIcon from "@mui/icons-material/Person";
import useBearStore from "@/store/useBearStore";

const NavigationLayout = ({ children }) => {
  const router = useRouter();
  const appName = useBearStore((state) => state.appName);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/register");
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#575757" }}>
        <Toolbar>
          {/* Updated Logo */}
          <Link href={"/page1"}>
            <img
              src="/image1.png" // Ensure this path is correct
              alt="Logo"
              style={{ width: "40px", height: "40px" }} // Adjust the size as needed
            />
          </Link>

          {/* Website Name */}
          <Typography
            variant="body1"
            sx={{
              fontSize: "22px",
              fontWeight: 500,
              color: "#ffffff",
              padding: "0 10px",
              fontFamily: "Prompt",
            }}
          >
            {appName}
          </Typography>

          {/* Calendar Button */}
          <Button
            variant="contained"
            onClick={() => router.push("/calendar")}
            sx={{
              marginLeft: "10px",
              backgroundColor: "#575757",
              color: "inherit",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            📆
          </Button>

          {/* Dashboard Button */}
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard")}
            sx={{
              marginLeft: "10px",
              backgroundColor: "#575757",
              color: "inherit",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            Dashboard
          </Button>

          {/* Spacer */}
          <div style={{ flexGrow: 1 }} />

          {/* Profile Button */}
          <Button
            color="inherit"
            onClick={() => router.push("/profile")}
            sx={{ color: "#fff", marginLeft: "10px" }}
          >
            <PersonIcon />
          </Button>

          {/* Logout Button */}
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ color: "#fff", marginLeft: "10px" }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  );
};

export default NavigationLayout;
