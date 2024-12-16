import { useCallback, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Stack,
  Select,
  MenuItem,
  Pagination,
  Modal,
  Autocomplete,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import { CSVLink } from "react-csv";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userName: "",
    email: "",
    startDate: "",
    endDate: "",
    notificationType: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    userName: "",
    email: "",
    startDate: "",
    endDate: "",
    notificationType: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [newNotification, setNewNotification] = useState({
    user_id: "",
    title: "",
    type: "",
    message: "",
  });
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { userName, email, startDate, endDate, notificationType } =
          appliedFilters;
        const queryParams = new URLSearchParams();
        if (userName) queryParams.append("userName", userName);
        if (email) queryParams.append("email", email);

        const formatTimestamp = (date) => (date ? `${date} 00:00:00` : null);
        if (startDate)
          queryParams.append("startDate", formatTimestamp(startDate));
        if (endDate) queryParams.append("endDate", formatTimestamp(endDate));

        if (notificationType)
          queryParams.append("notificationType", notificationType);
        queryParams.append("page", page - 1);
        queryParams.append("size", 10);

        const response = await axios.get(
          `http://localhost:8080/api/notifications/search?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNotifications(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        toast.error("Không thể tải danh sách thông báo: " + err.message);
        setLoading(false);
      }
    },
    [appliedFilters, token]
  );

  const fetchEmails = async () => {
    try {
      let users = [];
      let page = 0;
      const size = 100;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await axios.get("http://localhost:8080/api/users", {
          params: { page, size },
          headers: { Authorization: `Bearer ${token}` },
        });

        users = [...users, ...response.data.content];
        hasNextPage = !response.data.last;
        page += 1;
      }

      setUserOptions(users);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage);
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchNotifications]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setNewNotification({
      user_id: "",
      title: "",
      type: "",
      message: "",
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveNotification = async () => {
    if (
      !newNotification.user_id ||
      !newNotification.title ||
      !newNotification.type ||
      !newNotification.message
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/notifications",
        newNotification,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => [...prev, response.data]);
      toast.success("Tạo thông báo thành công!");
      handleCloseModal();
    } catch (err) {
      toast.error("Tạo thông báo thất bại: " + err.message);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.filter((notification) => notification.notification_id !== id)
      );
      toast.success("Xóa thông báo thành công!");
    } catch (err) {
      toast.error("Xóa thông báo thất bại: " + err.message);
    }
  };

  const getNotificationTypeLabel = (type) => {
    const typeMap = {
      REMINDER_BEFORE_DUE_DATE: "Nhắc Trước Hạn",
      OVERDUE_NOTIFICATION: "Quá Hạn",
      ACCOUNT_NOTIFICATION: "Tài Khoản",
      FINE_NOTIFICATION: "Phạt",
    };
    return typeMap[type] || "Không xác định";
  };

  if (loading) return <Typography>Đang tải danh sách thông báo...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={2} textAlign="center">
        Quản Lý Thông Báo
      </Typography>

      <Stack spacing={2} mb={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Tên Người Dùng"
            name="userName"
            value={filters.userName}
            onChange={handleFilterChange}
            size="small"
            sx={{ width: "20%" }}
          />
          <TextField
            label="Email"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            size="small"
            sx={{ width: "20%" }}
          />
          <TextField
            label="Từ Ngày"
            variant="outlined"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: "20%" }}
          />
          <TextField
            label="Đến Ngày"
            variant="outlined"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: "20%" }}
          />
          <Select
            name="notificationType"
            value={filters.notificationType}
            onChange={handleFilterChange}
            size="small"
            displayEmpty
            sx={{ width: "20%" }}
          >
            <MenuItem value="">Tất Cả</MenuItem>
            <MenuItem value="REMINDER_BEFORE_DUE_DATE">Nhắc Trước Hạn</MenuItem>
            <MenuItem value="OVERDUE_NOTIFICATION">Quá Hạn</MenuItem>
            <MenuItem value="ACCOUNT_NOTIFICATION">Tài Khoản</MenuItem>
            <MenuItem value="FINE_NOTIFICATION">Phạt</MenuItem>
          </Select>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            sx={{ height: "40px", width: "10%" }}
          >
            Tìm Kiếm
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenModal}
            sx={{ height: "40px", width: "15%" }}
          >
            Tạo Thông Báo
          </Button>
          <CSVLink
            data={notifications.map((notification, index) => ({
              STT: (currentPage - 1) * 10 + index + 1,
              "Tên Người Nhận": notification.user_name,
              Email: notification.email,
              "Tiêu Đề": notification.title,
              "Nội Dung": notification.message,
              "Thời Gian Gửi": dayjs(notification.sent_at).format("DD/MM/YYYY"),
              "Loại Thông Báo": getNotificationTypeLabel(notification.type),
            }))}
            filename={`DanhSachThongBao_${dayjs().format(
              "YYYYMMDD_HHmmss"
            )}.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              size="small"
              color="success"
              sx={{ height: "40px", width: 120 }}
            >
              Xuất CSV
            </Button>
          </CSVLink>
        </Stack>
      </Stack>

      <Paper>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ width: 50 }}>STT</TableCell>
                <TableCell sx={{ width: 240 }}>Tên Người Nhận</TableCell>
                <TableCell sx={{ width: 200 }}>Email</TableCell>
                <TableCell
                  sx={{ width: 300, maxWidth: 300, wordWrap: "break-word" }}
                >
                  Tiêu Đề
                </TableCell>
                <TableCell
                  sx={{ width: 400, maxWidth: 400, wordWrap: "break-word" }}
                >
                  Nội Dung
                </TableCell>
                <TableCell sx={{ width: 150 }}>Thời Gian Gửi</TableCell>
                <TableCell sx={{ width: 280 }}>Loại Thông Báo</TableCell>
                <TableCell sx={{ width: 120 }}>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <TableRow key={notification.notification_id}>
                    <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                    <TableCell>{notification.user_name}</TableCell>
                    <TableCell>{notification.email}</TableCell>
                    <TableCell sx={{ maxWidth: 300, wordWrap: "break-word" }}>
                      {notification.title}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400, wordWrap: "break-word" }}>
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      {dayjs(notification.sent_at).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      {getNotificationTypeLabel(notification.type)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() =>
                          handleDeleteNotification(notification.notification_id)
                        }
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không tìm thấy kết quả phù hợp!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Tạo Thông Báo Mới
          </Typography>

          <Stack spacing={2}>
            <Autocomplete
              options={userOptions}
              getOptionLabel={(option) => option.email || ""}
              value={
                userOptions.find(
                  (user) => user.id === newNotification.user_id
                ) || null
              }
              onChange={(event, value) => {
                if (value) {
                  setNewNotification((prev) => ({
                    ...prev,
                    user_id: value.id,
                  }));
                } else {
                  setNewNotification((prev) => ({
                    ...prev,
                    user_id: "",
                  }));
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Email Người Nhận" fullWidth />
              )}
            />

            <TextField
              label="Tiêu Đề"
              value={newNotification.title}
              onChange={(event) =>
                setNewNotification((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              fullWidth
            />

            <TextField
              label="Nội Dung"
              value={newNotification.message}
              onChange={(event) =>
                setNewNotification((prev) => ({
                  ...prev,
                  message: event.target.value,
                }))
              }
              multiline
              rows={4}
              fullWidth
            />

            <Select
              value={newNotification.type}
              onChange={(event) =>
                setNewNotification((prev) => ({
                  ...prev,
                  type: event.target.value,
                }))
              }
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Chọn Loại Thông Báo</MenuItem>
              <MenuItem value="REMINDER_BEFORE_DUE_DATE">
                Nhắc Trước Hạn
              </MenuItem>
              <MenuItem value="OVERDUE_NOTIFICATION">Quá Hạn</MenuItem>
              <MenuItem value="ACCOUNT_NOTIFICATION">Tài Khoản</MenuItem>
              <MenuItem value="FINE_NOTIFICATION">Phạt</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <Button variant="contained" onClick={handleSaveNotification}>
              Lưu
            </Button>
            <Button variant="outlined" onClick={handleCloseModal}>
              Hủy
            </Button>
          </Stack>
        </Box>
      </Modal>

      <ToastContainer position="top-center" autoClose={1500} />
    </Box>
  );
}
