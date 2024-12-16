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
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const BookCopySelectionModal = ({ open, onClose, bookId, onSelect }) => {
  const [bookCopies, setBookCopies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingButtons, setLoadingButtons] = useState({}); // Trạng thái loading cho từng button

  useEffect(() => {
    if (open) {
      fetchBookCopies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  const fetchBookCopies = async () => {
    try {
      const response = await axios.get(`/api/book-copies/search`, {
        params: {
          status: "AVAILABLE",
          bookId: bookId,
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

  const handleSelect = async (copyId) => {
    setLoadingButtons((prev) => ({ ...prev, [copyId]: true })); // Bật loading cho button
    try {
      await onSelect(copyId); // Gọi service từ prop `onSelect`
    } catch (error) {
      console.error("Error selecting book copy:", error);
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [copyId]: false })); // Tắt loading cho button
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
          Lựa chọn đầu sách cho mượn
        </Typography>
        <Grid container spacing={2}>
          {bookCopies.map((copy) => (
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
                    <strong>Trạng thái:</strong> {translateStatus(copy.status)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="medium"
                    variant="contained"
                    color="primary"
                    sx={{
                      fontSize: "1rem",
                      padding: "8px 16px",
                      ...(loadingButtons[copy.copy_id] && {
                        animation: "spin 1s linear infinite",
                      }),
                    }}
                    onClick={() => handleSelect(copy.copy_id)}
                    disabled={loadingButtons[copy.copy_id]} 
                  >
                    {loadingButtons[copy.copy_id] ? "Đang xử lý..." : "Chọn"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
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
      </Box>
    </Modal>
  );
};

export default BookCopySelectionModal;
