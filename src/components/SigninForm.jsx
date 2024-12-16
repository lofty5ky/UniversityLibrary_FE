import { useState } from "react";
import { Button, Stack, TextField, Typography, colors } from "@mui/material";
import { ScreenMode } from "../constant/constants.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SigninForm = ({ onSwitchMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email không được để trống";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/login",
          {
            email,
            password,
          }
        );

        const token = response.data;

        localStorage.setItem("token", token);

        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles = payload.roles;

        if (roles.includes("admin")) {
          navigate("/admin/book-management");
        } else if (roles.includes("user")) {
          navigate("/client/home");
        } else {
          alert("Không thể xác định vai trò người dùng");
        }
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        setErrors({ ...errors, password: `${error.response.data}` });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100%",
        color: colors.grey[800],
      }}
    >
      <Stack
        spacing={5}
        sx={{
          width: "100%",
          maxWidth: "500px",
        }}
        onKeyDown={handleKeyDown} //
      >
        <Stack>
          <Typography variant="h4" fontWeight={600} color={colors.grey[800]}>
            Chào mừng
          </Typography>
          <Typography color={colors.grey[600]}>
            Hệ thống quản lý thư viện của trường đại học Nguyễn Tất Thành
          </Typography>
        </Stack>

        <Stack spacing={4}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Email</Typography>
              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Stack>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Mật khẩu</Typography>
              <TextField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Stack>
          </Stack>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: colors.grey[800],
              "&:hover": {
                bgcolor: colors.grey[600],
              },
            }}
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Typography>Bạn chưa có tài khoản?</Typography>
          <Typography
            onClick={() => onSwitchMode(ScreenMode.SIGN_UP)}
            fontWeight={600}
            sx={{
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Đăng ký ngay
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SigninForm;
