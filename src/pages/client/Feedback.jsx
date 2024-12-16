import * as React from "react";
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
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Modal,
  Stack,
  Pagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast, ToastContainer } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [feedbackInput, setFeedbackInput] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedFeedback, setSelectedFeedback] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [feedbackDetails, setFeedbackDetails] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const size = 5; // Số phần tử trên mỗi trang

  React.useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      const response = await axios.get(
        `http://localhost:8080/api/feedbacks/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  const handleSendFeedback = async () => {
    if (feedbackInput.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      const body = {
        user_id: userId,
        message: feedbackInput,
      };

      await axios.post("http://localhost:8080/api/feedbacks", body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFeedbackInput("");
      fetchFeedbacks();
      toast.success("Gửi góp ý thành công!");
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Có lỗi xảy ra khi gửi!");
    }
  };

  const handleOpenDeleteModal = (feedback) => {
    setSelectedFeedback(feedback);
    setDeleteModalOpen(true);
  };

  const handleMenuOpen = (event, feedback) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedback(feedback);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedback(null);
  };

  const handleDeleteFeedback = async (selectedFeedback) => {
    try {
      const feedbackId = selectedFeedback.id;
      await axios.delete(`http://localhost:8080/api/feedbacks/${feedbackId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setFeedbacks(feedbacks.filter((fb) => fb.id !== feedbackId));
      setDeleteModalOpen(false);
      handleMenuClose();
      toast.success("Xóa thành công!");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
    }
  };

  const handleViewFeedback = async () => {
    try {
      const feedbackId = selectedFeedback.id;

      const response = await axios.get(
        `http://localhost:8080/api/feedbacks/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setFeedbackDetails(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching feedback details:", error);
    }

    handleMenuClose();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFeedbackDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa nhận";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const displayedFeedbacks = feedbacks.slice((page - 1) * size, page * size);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        marginBottom={3}
      >
        Góp Ý & Phản Hồi
      </Typography>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        <TextField
          label="Mô tả ý kiến của bạn"
          variant="outlined"
          fullWidth
          value={feedbackInput}
          onChange={(e) => setFeedbackInput(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendFeedback}
          style={{
            width: "100px",
            borderRadius: "10px",
          }}
        >
          Gửi
        </Button>
      </Box>

      <ToastContainer position="top-center" autoClose={3000} />

      {feedbacks.length > 0 ? (
        <>
          <Typography variant="h5" fontWeight="bold" marginBottom={2}>
            Danh sách góp ý đã gửi cho thư viện
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                  <TableCell align="center">STT</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell align="center">Ngày gửi</TableCell>
                  <TableCell align="center">Ngày nhận phản hồi</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedFeedbacks.map((feedback, index) => (
                  <TableRow key={feedback.id}>
                    <TableCell align="center">
                      {(page - 1) * size + index + 1}
                    </TableCell>
                    <TableCell>{feedback.message}</TableCell>
                    <TableCell align="center">
                      {formatDate(feedback.submitted_at)}
                    </TableCell>
                    <TableCell align="center">
                      {formatDate(feedback.response_at)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          feedback.is_response ? "Đã nhận phản hồi" : "Đã gửi"
                        }
                        sx={{
                          backgroundColor: feedback.is_response
                            ? "green"
                            : "orange",
                          color: "white",
                          fontWeight: "bold",
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(event) => handleMenuOpen(event, feedback)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
            <Pagination
              count={Math.ceil(feedbacks.length / size)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      ) : (
        <Typography
          variant="h6"
          textAlign="center"
          marginTop={4}
          color="text.secondary"
        >
          Bạn chưa tạo ra góp ý nào!
        </Typography>
      )}

      {/* Menu hành động */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            backgroundColor: "#fff5da",
          },
        }}
      >
        <MenuItem onClick={handleViewFeedback}>
          <VisibilityIcon sx={{ marginRight: 1, color: "action.active" }} />
          Xem phản hồi
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenDeleteModal(selectedFeedback);
          }}
        >
          <DeleteIcon sx={{ marginRight: 1, color: "action.active" }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Modal hiển thị chi tiết phản hồi */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="feedback-details-title"
        aria-describedby="feedback-details-description"
      >
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
          {feedbackDetails && (
            <Stack spacing={2}>
              <Typography
                id="feedback-details-title"
                variant="h6"
                fontWeight="bold"
              >
                Chi tiết phản hồi
              </Typography>
              <Typography>
                <strong>Nội dung:</strong> {feedbackDetails.message}
              </Typography>
              <Typography>
                <strong>Ngày gửi:</strong>{" "}
                {formatDate(feedbackDetails.submitted_at)}
              </Typography>
              <Typography>
                <strong>Phản hồi:</strong>{" "}
                {feedbackDetails.response || "Chưa có phản hồi"}
              </Typography>
              <Typography>
                <strong>Ngày phản hồi:</strong>{" "}
                {formatDate(feedbackDetails.response_at)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseModal}
              >
                Đóng
              </Button>
            </Stack>
          )}
        </Box>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        aria-labelledby="delete-confirmation-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="delete-confirmation-title"
            variant="h5"
            textAlign="center"
          >
            Bạn có chắc chắn muốn xóa góp ý này?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteFeedback(selectedFeedback)}
              sx={{
                marginRight: 1,
              }}
            >
              Xác nhận
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
