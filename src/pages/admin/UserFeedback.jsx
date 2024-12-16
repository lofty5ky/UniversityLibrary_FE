import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Pagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filters, setFilters] = useState({
    email: "",
    isResponse: "",
    startDate: "",
    endDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchFeedbacks = async (page = 1) => {
    try {
      const { email, isResponse, startDate, endDate } = appliedFilters;
      const queryParams = new URLSearchParams();
      if (email) queryParams.append("email", email);
      if (isResponse) queryParams.append("isResponse", isResponse);
      const formatTimestamp = (date) => (date ? `${date} 00:00:00` : null);

      if (startDate)
        queryParams.append("startDate", formatTimestamp(startDate));
      if (endDate) queryParams.append("endDate", formatTimestamp(endDate));

      queryParams.append("page", page - 1);
      queryParams.append("size", 10);
      const response = await axios.get(
        `http://localhost:8080/api/feedbacks/search?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFeedbacks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Không thể tải danh sách góp ý!");
    }
  };

  useEffect(() => {
    fetchFeedbacks(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/feedbacks/${selectedFeedback.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Xóa góp ý thành công!");
      fetchFeedbacks(currentPage);
      setDeleteDialogOpen(false);
      setSelectedFeedback(null);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Không thể xóa góp ý!");
    }
  };

  const handleReplyFeedback = async () => {
    if (!selectedFeedback || replyMessage.trim() === "") {
      toast.error("Nội dung phản hồi không được để trống!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/feedbacks/${selectedFeedback.id}`,
        { response: replyMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Phản hồi thành công!");
      setReplyDialogOpen(false);
      setReplyMessage("");
      fetchFeedbacks(currentPage);
    } catch (error) {
      console.error("Error replying to feedback:", error);
      toast.error("Không thể phản hồi góp ý!");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        marginBottom={3}
      >
        Quản Lý Góp Ý
      </Typography>

      <Stack spacing={2} marginBottom={3}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Email"
            name="email"
            sx={{ width: 280, height: "56px" }}
            value={filters.email}
            onChange={handleFilterChange}
            fullWidth
          />
          <TextField
            label="Từ Ngày"
            type="date"
            name="startDate"
            sx={{ width: 240, height: "56px" }}
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Đến Ngày"
            type="date"
            name="endDate"
            sx={{ width: 240, height: "56px" }}
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Select
            name="isResponse"
            value={filters.isResponse}
            onChange={handleFilterChange}
            displayEmpty
            sx={{ width: 200, height: "56px" }}
          >
            <MenuItem value="">Trạng thái</MenuItem>
            <MenuItem value="true">Đã Phản Hồi</MenuItem>
            <MenuItem value="false">Chưa Phản Hồi</MenuItem>
          </Select>
          <Button variant="contained" onClick={handleSearch}>
            Tìm Kiếm
          </Button>
        </Stack>
      </Stack>

      <ToastContainer position="top-center" autoClose={3000} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell align="center">STT</TableCell>
              <TableCell>Email Người Gửi</TableCell>
              <TableCell>Nội Dung Góp Ý</TableCell>
              <TableCell align="center">Ngày Nhận Góp Ý</TableCell>
              <TableCell align="center">Trạng Thái</TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback, index) => (
                <TableRow key={feedback.id}>
                  <TableCell align="center">
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell>{feedback.email}</TableCell>
                  <TableCell>{feedback.message}</TableCell>
                  <TableCell align="center">
                    {new Date(feedback.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={
                        feedback.is_response ? "Đã Phản Hồi" : "Chưa Phản Hồi"
                      }
                      color={feedback.is_response ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setReplyMessage(feedback.response || "");
                          setReplyDialogOpen(true);
                        }}
                      >
                        Phản Hồi
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Xóa
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không tìm thấy kết quả phù hợp!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>Bạn có chắc chắn muốn xóa?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteFeedback}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)}>
        <DialogTitle>Phản Hồi Góp Ý</DialogTitle>
        <DialogContent>
          <TextField
            label="Email Người Gửi"
            value={selectedFeedback?.email || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            margin="dense"
          />
          <TextField
            label="Tên Người Gửi"
            value={selectedFeedback?.user_name || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            margin="dense"
          />
          <TextField
            label="Nội Dung Góp Ý"
            value={selectedFeedback?.message || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            multiline
            rows={3}
            margin="dense"
          />
          <TextField
            label="Nội Dung Phản Hồi"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleReplyFeedback}
            variant="contained"
            color="primary"
          >
            Gửi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
