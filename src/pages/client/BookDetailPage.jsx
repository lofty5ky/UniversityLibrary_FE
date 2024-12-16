import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Breadcrumbs,
  Typography,
  Container,
  Grid,
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [cardInfo, setCardInfo] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("warning");

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`/api/books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

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
      }
    };

    fetchBookDetails();
    fetchLibraryCard();
  }, [id]);

  const handleBorrowRequest = async () => {
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

      if (!book || book.available_quantity === 0) {
        showAlertMessage("Số lượng không khả dụng để cho mượn!", "error");
        return;
      }

      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      const body = {
        user_id: userId,
        book_id: book.id,
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
      console.error("Error sending borrow request:", error);
      showAlertMessage(error.response?.data || "Có lỗi xảy ra!", "error");
    }
  };

  const showAlertMessage = (message, severity = "warning") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  if (!book) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      {/* Snackbar for alerts */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity={alertSeverity}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 3 }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          <Typography>Trang chủ</Typography>
        </Link>
        <Typography color="textPrimary">Chi tiết sách</Typography>
      </Breadcrumbs>

      {/* Book Details */}
      <Grid container spacing={4}>
        {/* Image */}
        <Grid item xs={12} sm={4}>
          <Box
            component="img"
            src={`http://localhost:8080/api/images/${book.image}`}
            alt={book.title}
            sx={{ width: "100%", height: "440px", borderRadius: 2 }}
          />
        </Grid>

        {/* Book Information */}
        <Grid item xs={12} sm={8}>
          <Typography variant="h4" gutterBottom>
            {book.title}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ fontWeight: "bold" }}>Tóm tắt nội dung: </span>
            {book.book_summary}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <Typography component="span" fontWeight="bold" fontSize="16px">
              Thể loại:
            </Typography>{" "}
            {book.category_name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <Typography component="span" fontWeight="bold" fontSize="16px">
              Năm xuất bản:
            </Typography>{" "}
            {book.publication_year}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <Typography component="span" fontWeight="bold" fontSize="16px">
              Nhà xuất bản:
            </Typography>{" "}
            {book.publisher_name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <Typography component="span" fontWeight="bold" fontSize="16px">
              Số lượng có sẵn:
            </Typography>{" "}
            {book.available_quantity}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: "#198754",
              padding: 1,
              marginTop: 2,
              borderColor: "#198754",
              borderRadius: "20px",
              ":hover": {
                backgroundColor: "#198754",
                color: "white",
              },
            }}
            onClick={handleBorrowRequest}
          >
            Gửi yêu cầu mượn
          </Button>
        </Grid>
      </Grid>

      {/* Author Information */}
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h5" gutterBottom color="#228B22">
          Tác giả và Tiểu sử
        </Typography>
        {book.authors.map((author, index) => (
          <Box key={index} sx={{ marginBottom: 3 }}>
            <Typography variant="h6">{author}</Typography>
            <Typography variant="body1">
              {book.author_biography[index]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default BookDetailPage;
