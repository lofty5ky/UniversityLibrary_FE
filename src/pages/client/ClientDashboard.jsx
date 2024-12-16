/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Pagination,
  Modal,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Configure base Axios instance
axios.defaults.baseURL = "http://localhost:8080";
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ClientDashboard = () => {
  const [search, setSearch] = useState({
    title: "",
    authorName: "",
    categoryId: "",
    publicationYear: "",
  });
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [cardInfo, setCardInfo] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("warning");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchAllBooks();
    fetchLibraryCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const fetchLibraryCard = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const email = payload.email;

      const response = await axios.get(`/api/library-cards`, {
        params: { email },
      });

      if (response.data) {
        setCardInfo(response.data.content[0]);
      }
    } catch (error) {
      console.error("Error fetching library card:", error);
      showAlertMessage("Không thể tải thông tin thẻ mượn sách.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/book-categories/public");
      setCategories(response.data);
    } catch (error) {
      showAlertMessage("Không thể tải danh mục");
    }
  };

  const fetchAllBooks = async () => {
    try {
      const response = await axios.get("/api/books", {
        params: { page, size },
      });
      setBooks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showAlertMessage("Không thể tải danh sách sách");
    }
  };

  const searchBooks = async () => {
    try {
      const response = await axios.get("/api/books/search", {
        params: {
          title: search.title || undefined,
          authorName: search.authorName || undefined,
          publicationYear: search.publicationYear || undefined,
          categoryId: search.categoryId || undefined,
          page,
          size,
        },
      });
      setBooks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showAlertMessage("Tìm kiếm không thành công");
    }
  };

  const handleSearchChange = (key, value) => {
    setSearch((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const showAlertMessage = (message, severity = "warning") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleLibraryCardRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode token
      const userId = payload.userId;

      const body = { user_id: userId };

      await axios.post("/api/library-cards/request", body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      showAlertMessage(
        "Yêu cầu tạo thẻ sách đã được gửi thành công!",
        "success"
      );
      setCardInfo({ status: "Đã gửi yêu cầu" });
    } catch (error) {
      console.error("Error requesting library card:", error);
      showAlertMessage("Có lỗi xảy ra khi gửi yêu cầu tạo thẻ sách.", "error");
    }
  };

  const handleBorrowRequest = async (bookId) => {
    try {
      if (!cardInfo) {
        showAlertMessage(
          "Bạn cần có thẻ mượn sách để thực hiện yêu cầu này.",
          "warning"
        );
        return;
      }

      if (cardInfo.status !== "ACTIVE") {
        const statusMessage = (() => {
          switch (cardInfo.status) {
            case "EXPIRED":
              return "Thẻ mượn sách của bạn đã hết hạn.";
            case "BLOCKED":
              return "Thẻ mượn sách của bạn đã bị khóa.";
            case "PENDING":
              return "Thẻ mượn sách của bạn đang chờ phê duyệt.";
            default:
              return "Thẻ mượn sách của bạn không hợp lệ.";
          }
        })();

        showAlertMessage(statusMessage, "error");
        return;
      }

      const selectedBook = books.find((book) => book.id === bookId);

      if (!selectedBook || selectedBook.available_quantity === 0) {
        showAlertMessage("Số lượng không khả dụng để cho mượn!", "error");
        return;
      }

      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      const body = {
        user_id: userId,
        book_id: bookId,
        reservation_date: new Date().toISOString(),
      };

      await axios.post("/api/reservations", body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      showAlertMessage("Yêu cầu mượn sách đã được gửi thành công!", "success");
    } catch (error) {
      showAlertMessage(error.response?.data || "Có lỗi xảy ra!", "error");
    }
  };

  const handleViewDetails = (bookId) => {
    navigate(`/client/book/${bookId}`);
  };

  return (
    <>
      <Snackbar
        open={showAlert}
        autoHideDuration={2000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alertSeverity}
          onClose={() => setShowAlert(false)}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <Stack spacing={4} sx={{ padding: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" textAlign="center" fontWeight="bold">
            Các Tác Phẩm Trong Thư Viện
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tựa đề"
                variant="outlined"
                fullWidth
                value={search.title}
                onChange={(e) => handleSearchChange("title", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Thể loại</InputLabel>
                <Select
                  labelId="category-label"
                  label="Thể loại"
                  id="category-select"
                  value={search.categoryId}
                  onChange={(e) =>
                    handleSearchChange("categoryId", e.target.value)
                  }
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên tác giả"
                variant="outlined"
                fullWidth
                value={search.authorName}
                onChange={(e) =>
                  handleSearchChange("authorName", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="year-label">Năm xuất bản</InputLabel>
                <Select
                  labelId="year-label"
                  label="Năm xuất bản"
                  id="year-select"
                  value={search.publicationYear}
                  onChange={(e) =>
                    handleSearchChange("publicationYear", e.target.value)
                  }
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Array.from(
                    { length: new Date().getFullYear() - 1900 + 1 },
                    (_, i) => 1900 + i
                  ).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ borderRadius: "20px", padding: "10px 30px" }}
              onClick={searchBooks}
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{ borderRadius: "20px", padding: "10px 30px" }}
              onClick={() => setShowModal(true)}
            >
              Thẻ mượn sách
            </Button>
          </Stack>
        </Stack>

        {/* Danh sách sách */}
        <Grid container spacing={2}>
          {books.length > 0 ? (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={3} key={book.id}>
                <Card sx={{ height: "100%" }}>
                  <CardMedia
                    component="img"
                    style={{ height: "240px", objectFit: "cover" }}
                    image={`http://localhost:8080/api/images/${book.image}`}
                    alt={book.title}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        WebkitLineClamp: 1,
                      }}
                    >
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tác giả: {book.authors?.join(", ") || "Chưa cập nhật"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Năm xuất bản: {book.publication_year}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Thể loại: {book.category_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Số lượng có sẵn: {book.available_quantity}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "center", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#198754",
                        borderColor: "#198754",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        ":hover": {
                          backgroundColor: "#198754",
                          color: "white",
                        },
                      }}
                      onClick={() => handleBorrowRequest(book.id)}
                    >
                      Yêu cầu mượn
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#dc3545",
                        borderColor: "#dc3545",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        ":hover": {
                          backgroundColor: "#dc3545",
                          color: "white",
                        },
                      }}
                      onClick={() => handleViewDetails(book.id)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" color="textSecondary" textAlign="center">
                Không tìm thấy kết quả!
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Pagination */}
        <Stack alignItems="center" sx={{ marginTop: 3 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>

        {/* Modal Thẻ mượn sách */}
        <Modal open={showModal} onClose={() => setShowModal(false)}>
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
            {cardInfo ? (
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  Thông tin thẻ mượn sách
                </Typography>
                {cardInfo.status !== "PENDING" &&
                  cardInfo.status !== "REJECTED" && (
                    <>
                      {cardInfo.user_name && (
                        <Typography>
                          <span style={{ fontWeight: "bold" }}>Họ và tên:</span>{" "}
                          {cardInfo.user_name}
                        </Typography>
                      )}
                      {cardInfo.phone_number && (
                        <Typography>
                          <span style={{ fontWeight: "bold" }}>
                            Số điện thoại:
                          </span>{" "}
                          {cardInfo.phone_number}
                        </Typography>
                      )}
                      {cardInfo.issue_date && (
                        <Typography>
                          <span style={{ fontWeight: "bold" }}>
                            Ngày cấp thẻ:
                          </span>{" "}
                          {new Date(cardInfo.issue_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {cardInfo.expiry_date && (
                        <Typography>
                          <span style={{ fontWeight: "bold" }}>
                            Ngày hết hạn:
                          </span>{" "}
                          {new Date(cardInfo.expiry_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </>
                  )}
                <Typography>
                  <span style={{ fontWeight: "bold" }}>Trạng thái:</span>{" "}
                  <span
                    style={{
                      color: (() => {
                        switch (cardInfo.status) {
                          case "PENDING":
                            return "orange";
                          case "ACTIVE":
                            return "green";
                          case "EXPIRED":
                            return "red";
                          case "BLOCKED":
                            return "gray";
                          case "REJECTED":
                            return "purple";
                          default:
                            return "orange";
                        }
                      })(),
                    }}
                  >
                    {(() => {
                      switch (cardInfo.status) {
                        case "PENDING":
                          return "Chờ phê duyệt";
                        case "ACTIVE":
                          return "Đang sử dụng";
                        case "EXPIRED":
                          return "Hết hạn";
                        case "BLOCKED":
                          return "Đã bị khóa";
                        case "REJECTED":
                          return "Từ chối cấp thẻ";
                        default:
                          return "Chờ phê duyệt";
                      }
                    })()}
                  </span>
                </Typography>
                <Stack alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={() => setShowModal(false)}
                    sx={{ width: "160px" }}
                  >
                    Đóng
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Bạn chưa có thẻ mượn sách</Typography>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#388e3c", color: "#ffffff" }}
                  onClick={handleLibraryCardRequest}
                  disabled={cardInfo?.status === "Đã gửi yêu cầu"}
                >
                  {cardInfo?.status === "Đã gửi yêu cầu"
                    ? "Đã gửi yêu cầu"
                    : "Yêu cầu tạo thẻ sách"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowModal(false)}
                  sx={{ width: "160px" }}
                >
                  Đóng
                </Button>
              </Stack>
            )}
          </Box>
        </Modal>
      </Stack>
    </>
  );
};

export default ClientDashboard;
