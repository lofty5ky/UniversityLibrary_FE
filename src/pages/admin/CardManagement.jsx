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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import { CSVLink } from "react-csv"; // Import CSVLink
import ActionButton from "../../components/ActionButton";

export default function CardManagement() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    userName: "",
    email: "",
    status: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    userName: "",
    email: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [actionDialog, setActionDialog] = useState({
    open: false,
    cardId: null,
    action: "",
    message: "",
  });

  const actionMapping = {
    approve: "Phê duyệt",
    reject: "Từ chối",
    lock: "Khóa",
    unlock: "Mở khóa",
    delete: "Xóa",
  };

  const token = localStorage.getItem("token");

  const fetchCards = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { userName, email, status } = appliedFilters;

        const queryParams = new URLSearchParams();
        if (userName) queryParams.append("userName", userName);
        if (email) queryParams.append("email", email);
        if (status) queryParams.append("status", status);

        queryParams.append("page", page - 1);
        queryParams.append("size", 10);

        const response = await axios.get(
          `http://localhost:8080/api/library-cards?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCards(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách thẻ: " + err.message);
        setLoading(false);
      }
    },
    [appliedFilters, token]
  );

  useEffect(() => {
    fetchCards(currentPage);
  }, [currentPage, fetchCards]);

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

  const handleOpenActionDialog = (cardId, action) => {
    setActionDialog({
      open: true,
      cardId,
      action,
      message: `Bạn có chắc chắn muốn ${actionMapping[
        action
      ].toLowerCase()} thẻ này?`,
    });
  };

  const handleCloseActionDialog = () => {
    setActionDialog({ open: false, cardId: null, action: "", message: "" });
  };

  const handleConfirmAction = async () => {
    const { cardId, action } = actionDialog;
    try {
      await axios.put(
        `http://localhost:8080/api/library-cards/${cardId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${actionMapping[action]} thẻ thành công!`);
      setTimeout(() => {
        fetchCards(currentPage);
      }, 1500);
      handleCloseActionDialog();
    } catch (err) {
      toast.error(`${action} thất bại: ${err.message}`);
      handleCloseActionDialog();
    }
  };

  // Chuẩn bị dữ liệu CSV
  const csvData = cards.map((card, index) => ({
    STT: (currentPage - 1) * 10 + index + 1,
    "Tên Thành Viên": card.user_name,
    Email: card.email,
    "Ngày Tạo": dayjs(card.issue_date).format("DD/MM/YYYY"),
    "Ngày Hết Hạn": dayjs(card.expiry_date).format("DD/MM/YYYY"),
    "Tình Trạng":
      {
        ACTIVE: "Đang sử dụng",
        EXPIRED: "Hết hạn",
        BLOCKED: "Bị khóa",
        PENDING: "Chờ duyệt",
        REJECTED: "Đã từ chối",
      }[card.status] || "Không xác định",
  }));

  if (loading) return <Typography>Đang tải danh sách thẻ...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={2} textAlign="center">
        Quản Lý Thẻ
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Tên Thành Viên"
          variant="outlined"
          name="userName"
          value={filters.userName}
          onChange={handleFilterChange}
          size="small"
          sx={{ width: "25%" }}
        />
        <TextField
          label="Email thành viên"
          variant="outlined"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          size="small"
          sx={{ width: "25%" }}
        />
        <Select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          size="small"
          displayEmpty
          renderValue={(selected) => {
            if (selected === "") {
              return "Tình trạng";
            }
            return (
              {
                ACTIVE: "Đang Sử Dụng",
                PENDING: "Chờ Duyệt",
                BLOCKED: "Bị Khóa",
                REJECTED: "Đã Từ Chối",
                EXPIRED: "Hết Hạn",
              }[selected] || "Tất Cả"
            );
          }}
          sx={{ width: "20%" }}
        >
          <MenuItem value="">Tất Cả</MenuItem>
          <MenuItem value="ACTIVE">Đang Sử Dụng</MenuItem>
          <MenuItem value="PENDING">Chờ Duyệt</MenuItem>
          <MenuItem value="BLOCKED">Bị Khóa</MenuItem>
          <MenuItem value="REJECTED">Đã Từ Chối</MenuItem>
          <MenuItem value="EXPIRED">Hết Hạn</MenuItem>
        </Select>
        <Button
          variant="contained"
          size="small"
          onClick={handleSearch}
          sx={{
            height: "40px",
            width: "10%",
          }}
        >
          Tìm Kiếm
        </Button>
        <CSVLink
          data={csvData}
          filename={`DanhSachThe_${dayjs().format("YYYYMMDD_HHmmss")}.csv`}
          style={{ textDecoration: "none" }}
        >
          <Button variant="contained" size="small" color="success" sx={{ height: "40px" }}>
            Xuất CSV
          </Button>
        </CSVLink>
      </Stack>

      {/* Bảng dữ liệu */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>STT</TableCell>
                <TableCell>Tên Thành Viên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ngày Tạo</TableCell>
                <TableCell>Ngày Hết Hạn</TableCell>
                <TableCell>Tình Trạng</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.length > 0 ? (
                cards.map((card, index) => (
                  <TableRow key={card.card_id}>
                    <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                    <TableCell>{card.user_name}</TableCell>
                    <TableCell>{card.email}</TableCell>
                    <TableCell>
                      {dayjs(card.issue_date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      {dayjs(card.expiry_date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          {
                            ACTIVE: "green",
                            EXPIRED: "gray",
                            BLOCKED: "red",
                            PENDING: "orange",
                            REJECTED: "purple",
                          }[card.status] || "black",
                        fontWeight: "bold",
                      }}
                    >
                      {{
                        ACTIVE: "Đang sử dụng",
                        EXPIRED: "Hết hạn",
                        BLOCKED: "Bị khóa",
                        PENDING: "Chờ duyệt",
                        REJECTED: "Đã từ chối",
                      }[card.status] || "Không xác định"}
                    </TableCell>

                    <TableCell>
                      {["approve", "reject", "lock", "delete"].map((action) => (
                        <ActionButton
                          key={action}
                          action={action}
                          card={card}
                          handleAction={handleOpenActionDialog}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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

      <Dialog open={actionDialog.open} onClose={handleCloseActionDialog}>
        <DialogTitle>Thao Tác</DialogTitle>
        <DialogContent>
          <DialogContentText>{actionDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color="primary"
          >
            Xác Nhận
          </Button>
          <Button onClick={handleCloseActionDialog} variant="outlined">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-center" autoClose={1000} />
    </Box>
  );
}
