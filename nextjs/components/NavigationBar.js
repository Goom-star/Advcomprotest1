import * as React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";
import FunctionsIcon from "@mui/icons-material/Functions";
import PersonIcon from "@mui/icons-material/Person";
import useBearStore from "@/store/useBearStore";



const NavigationLayout = ({ children }) => {
  const router = useRouter();
  const appName = useBearStore((state) => state.appName);

  // Logout function
  const handleLogout = () => {
    // Clear session data (e.g., remove token from localStorage)
    localStorage.removeItem("token");
    // Redirect to the login or register page after logout
    router.push("/register");
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#575757" }}>
        <Toolbar>
          <Link href={"/page1"}>
            <FunctionsIcon sx={{ color: "#ffffff" }} fontSize="large" />
          </Link>
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
          <div style={{ flexGrow: 1 }} />
          {/* Profile Button */}
          <Button
            color="inherit"
            onClick={() => router.push("/profile")} // Navigate to the profile page
            sx={{ color: "#fff" }}
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
