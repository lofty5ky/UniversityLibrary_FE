import { useState } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { ExitToApp as ExitToAppIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const LogoutItem = () => {
  const [open, setOpen] = useState(false); // State để quản lý popup
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOpenDialog = () => setOpen(true);
  const handleCloseDialog = () => setOpen(false);

  return (
    <>
      {/* Menu Item Đăng Xuất */}
      <ListItem
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "#e5e5c9",
            borderRadius: "8px",
            transition: "all 0.3s ease",
          },
        }}
        onClick={handleOpenDialog}
      >
        <ListItemIcon sx={{ color: "#4b4b4b" }}>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText
          primary="Đăng xuất"
          sx={{
            color: "#4b4b4b",
          }}
        />
      </ListItem>

      {/* Dialog Xác Nhận */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Đăng Xuất</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Bạn có chắc chắn muốn đăng xuất không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleLogout();
              handleCloseDialog();
            }}
            color="error"
            variant="contained"
          >
            Xác nhận
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutItem;
