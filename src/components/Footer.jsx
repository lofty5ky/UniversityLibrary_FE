import { Box, Typography, Grid, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0, 
        backgroundColor: "#556B2F",
        color: "#FAFAD2",
        padding: "16px 24px",
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        borderTop: "1px solid #FAFAD2",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight="bold">
            Thư viện Đại học XYZ
          </Typography>
          <Typography variant="body2">
            Địa chỉ: 123 Đường ABC, Quận DEF, TP. Hồ Chí Minh
          </Typography>
          <Typography variant="body2">Điện thoại: (028) 1234 5678</Typography>
          <Typography variant="body2">Email: library@xyz.edu.vn</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight="bold">
            Thời gian hoạt động
          </Typography>
          <Typography variant="body2">
            Thứ Hai - Thứ Sáu: 8:00 - 21:00
          </Typography>
          <Typography variant="body2">Thứ Bảy: 8:00 - 17:00</Typography>
          <Typography variant="body2">Chủ Nhật: Nghỉ</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight="bold">
            Liên kết nhanh
          </Typography>
          <Typography variant="body2">
            <Link href="/client/home" color="#FAFAD2" underline="hover">
              Trang chủ
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link href="/client/feedback" color="#FAFAD2" underline="hover">
              Góp ý và phản hồi
            </Link>
          </Typography>
        </Grid>
      </Grid>

      <Box mt={2} textAlign="center" fontSize="14px">
        <Typography variant="body2">
          © {new Date().getFullYear()} Thư viện Đại học XYZ. Tất cả các quyền được bảo lưu.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
