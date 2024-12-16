import { AppBar, Toolbar, Typography, Avatar, Box } from "@mui/material";
import USER_IMAGE from "../assets/images/malecostume-512.webp";
import { useEffect, useState } from "react";

const Header = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(token.split(".")[1]))));
        setUserName(payload.userName);
      } catch (error) {
        console.error("Token không hợp lệ:", error);
      }
    }
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#556B2F",
        color: "#FAFAD2",
        borderRadius: "0px 0px 4px 4px",
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Thư Viện
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography
            variant="body2"
            sx={{
              mr: 2,
              fontSize: "0.875rem",
            }}
          >
            {userName}
          </Typography>
          <Avatar src={USER_IMAGE} alt="User Avatar" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
