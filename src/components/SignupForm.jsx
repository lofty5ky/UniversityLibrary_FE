import { useState } from "react";
import { Button, Stack, TextField, Typography, colors } from "@mui/material";
import { ScreenMode } from "../constant/constants.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = ({ onSwitchMode }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [apiError, setApiError] = useState("");

  const validate = () => {
    let valid = true;
    const newErrors = { fullName: "", email: "", password: "", phone: "" };

    if (!fullName) {
      newErrors.fullName = "Họ và tên không được để trống";
      valid = false;
    } else if (fullName.length <= 10) {
      newErrors.fullName = "Họ và tên phải dài hơn 10 ký tự";
      valid = false;
    }

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

    if (!phone) {
      newErrors.phone = "Số điện thoại không được để trống";
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Số điện thoại phải có đúng 10 chữ số";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  const handleSignup = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: fullName,
        email,
        phone_number: phone,
        password,
      };
      const response = await axios.post("http://localhost:8080/api/auth/register", payload);
      const token = response.data;
      localStorage.setItem("token", token);
      
      navigate("/client/home");
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data || "Đăng ký thất bại");
      } else {
        setApiError("Không thể kết nối tới server.");
      }
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
      >
        <Stack>
          <Typography variant="h4" fontWeight={600} color={colors.grey[800]}>
            Tạo tài khoản
          </Typography>
          <Typography color={colors.grey[600]}>
            Bạn cần nhập vào thông tin để tạo tài khoản
          </Typography>
        </Stack>

        {apiError && (
          <Typography color="error" sx={{ textAlign: "center" }}>
            {apiError}
          </Typography>
        )}

        <Stack spacing={4}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Họ và tên</Typography>
              <TextField
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Stack>
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
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Số điện thoại</Typography>
              <TextField
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
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
            onClick={handleSignup}
          >
            Đăng ký
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Typography>Đã có tài khoản?</Typography>
          <Typography
            onClick={() => onSwitchMode(ScreenMode.SIGN_IN)}
            fontWeight={600}
            sx={{
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Đăng nhập
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SignupForm;
