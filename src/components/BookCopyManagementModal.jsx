import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Pagination,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const BookCopyManagementModal = ({
  open,
  onClose,
  bookId,
  bookTitle,
  onShowToast,
}) => {
  const [bookCopies, setBookCopies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    copyId: "",
    condition: "",
    status: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCopy, setSelectedCopy] = useState({
    copy_id: "",
    condition: "",
    status: "",
  });

  useEffect(() => {
    if (open) {
      fetchBookCopies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, filters]);

  const fetchBookCopies = async () => {
    try {
      const response = await axios.get(`/api/book-copies/search`, {
        params: {
          bookId: bookId,
          copyId: filters.copyId || undefined,
          condition: filters.condition || undefined,
          status: filters.status || undefined,
          page: page - 1,
          size: 12,
        },
      });
      setBookCopies(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching book copies:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenEditModal = (mode, copy = null) => {
    setModalMode(mode);
    if (mode === "edit" && copy) {
        console.log(copy);
      setSelectedCopy(copy);
    } else {
      setSelectedCopy({
        copyId: "",
        condition: "",
        status: "",
      });
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSave = async () => {
    try {
      if (modalMode === "edit") {
        await axios.put(`/api/book-copies/${selectedCopy.copy_id}`, {
          book_id: bookId,
          condition: selectedCopy.condition,
          status: selectedCopy.status,
        });
        onShowToast("Sửa thông tin bản sao sách thành công!", "success");
      } else {
        await axios.post(`/api/book-copies`, {
          book_id: bookId,
          condition: selectedCopy.condition,
          status: selectedCopy.status,
        });
        onShowToast("Thêm bản sao sách thành công!", "success");
      }
      fetchBookCopies();
      handleCloseEditModal();
    } catch (error) {
      console.error(
        `Error ${modalMode === "edit" ? "updating" : "creating"} book copy:`,
        error
      );
    }
  };

  const handleDeleteBookCopy = async (copyId) => {
    try {
      await axios.delete(`/api/book-copies/${copyId}`);
      onShowToast("Xóa bản sao sách thành công!", "success");
      fetchBookCopies();
    } catch (error) {
      console.error("Error deleting book copy:", error);
      onShowToast("Lỗi khi xóa bản sao sách!", "error");
    }
  };

  const translateCondition = (condition) => {
    switch (condition) {
      case "NEW":
        return "Sách mới";
      case "GOOD":
        return "Chất lượng ổn";
      case "WORN":
        return "Sách cũ";
      case "DAMAGED":
        return "Bị hư hại";
      default:
        return "Không xác định";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "Có sẵn";
      case "BORROWED":
        return "Đang cho mượn";
      default:
        return "Không xác định";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      sx={{ overflowY: "scroll" }}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          overflowY: "auto",
          p: 4,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          <CloseIcon fontSize="large" />
        </Box>
        <Typography
          variant="h5"
          fontWeight="bold"
          id="modal-title"
          gutterBottom
          sx={{ color: "#8B4513" }}
          mb={2}
        >
          Các đầu sách của {bookTitle}
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            label="Mã đầu sách"
            fullWidth
            value={filters.copyId}
            onChange={(e) => handleFilterChange("copyId", e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Tình trạng</InputLabel>
            <Select
              label="Tình trạng"
              value={filters.condition}
              onChange={(e) => handleFilterChange("condition", e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="NEW">Sách mới</MenuItem>
              <MenuItem value="GOOD">Chất lượng ổn</MenuItem>
              <MenuItem value="WORN">Sách cũ</MenuItem>
              <MenuItem value="DAMAGED">Bị hư hại</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="AVAILABLE">Có sẵn</MenuItem>
              <MenuItem value="BORROWED">Đang cho mượn</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Button
          variant="contained"
          color="success"
          sx={{ marginBottom: 3 }}
          onClick={() => handleOpenEditModal("add")}
        >
          Thêm mới
        </Button>
        <Grid container spacing={2}>
          {bookCopies.length > 0 ? (
            bookCopies.map((copy) => (
              <Grid item xs={12} sm={6} md={3} key={copy.copy_id}>
                <Card>
                  <CardMedia
                    component="img"
                    style={{ height: "240px", objectFit: "cover" }}
                    image={`http://localhost:8080/api/images/${copy.book_image}`}
                    alt={copy.book_title}
                  />
                  <CardContent>
                    <Typography variant="h6">{copy.book_title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Mã đầu sách:</strong> {copy.copy_id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Tình trạng:</strong>{" "}
                      {translateCondition(copy.condition)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Trạng thái:</strong>{" "}
                      {translateStatus(copy.status)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="medium"
                      variant="contained"
                      color="info"
                      onClick={() => handleOpenEditModal("edit", copy)}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="medium"
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteBookCopy(copy.copy_id)}
                    >
                      Xóa
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="textSecondary"
                textAlign="center"
                sx={{ mt: 3 }}
              >
                Không tìm thấy kết quả phù hợp!
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Đóng
          </Button>
        </Box>
        <Modal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          aria-labelledby="edit-modal-title"
          sx={{ overflowY: "auto" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              id="edit-modal-title"
              variant="h6"
              textAlign="center"
              mb={3}
            >
              {modalMode === "edit"
                ? "Chỉnh sửa đầu sách"
                : "Thêm mới đầu sách"}
            </Typography>
            <Stack spacing={2}>
              {modalMode === "edit" && (
                <TextField
                  label="Mã đầu sách"
                  value={selectedCopy.copy_id }
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}
              <FormControl fullWidth>
                <InputLabel>Tình trạng</InputLabel>
                <Select
                  label="Tình trạng"
                  value={selectedCopy.condition}
                  onChange={(e) =>
                    setSelectedCopy((prev) => ({
                      ...prev,
                      condition: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="NEW">Sách mới</MenuItem>
                  <MenuItem value="GOOD">Chất lượng ổn</MenuItem>
                  <MenuItem value="WORN">Sách cũ</MenuItem>
                  <MenuItem value="DAMAGED">Bị hư hại</MenuItem>
                </Select>
              </FormControl>
              {modalMode === "edit" && (
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    label="Trạng thái"
                    value={selectedCopy.status}
                    onChange={(e) =>
                      setSelectedCopy((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    disabled={modalMode === "edit"}
                  >
                    <MenuItem value="AVAILABLE">Có sẵn</MenuItem>
                    <MenuItem value="BORROWED">Đang cho mượn</MenuItem>
                  </Select>
                </FormControl>
              )}
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button variant="outlined" onClick={handleCloseEditModal}>
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  {modalMode === "edit" ? "Lưu" : "Thêm"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Modal>
  );
};

export default BookCopyManagementModal;
