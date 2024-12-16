import { useEffect, useState } from "react";
import {
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { CSVLink } from "react-csv";
import BookModal from "../../components/BookModal";
import BookCopyManagementModal from "../../components/BookCopyManagementModal";

export default function BookManagement() {
  const [filters, setFilters] = useState({
    title: "",
    categoryId: "",
    authorName: "",
    publicationYear: "",
  });
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedBookTitle, setSelectedBookTitle] = useState("");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    fetchCategories();
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/book-categories/public");
      setCategories(response.data);
    } catch (error) {
      console.log(`Error: ${error}`);
      showToast("Không thể tải danh mục", "error");
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get("/api/books/search", {
        params: {
          title: filters.title || undefined,
          categoryId: filters.categoryId || undefined,
          authorName: filters.authorName || undefined,
          publicationYear: filters.publicationYear || undefined,
          page,
          size: 12,
        },
      });
      setBooks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(`Error: ${error}`);
      showToast("Không thể tải danh sách sách", "error");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchBooks();
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const showToast = (message, severity) => {
    setToast({ open: true, message, severity });
  };

  const handleOpenModal = (bookId = null) => {
    setSelectedBookId(bookId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookId(null);
  };

  const handleOpenCopyModal = (book) => {
    setSelectedBookTitle(book.title);
    setSelectedBookId(book.id);
    setIsCopyModalOpen(true);
  };

  const handleCloseCopyModal = () => {
    setIsCopyModalOpen(false);
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`/api/books/${bookId}`);
      showToast("Xóa sách thành công!", "success");
      fetchBooks();
    } catch (error) {
      showToast(
        "Lỗi khi xóa sách. Dữ liệu này có liên quan đến các mục khác trong hệ thống. Vui lòng kiểm tra các liên kết và thử lại!",
        "error"
      );
      console.error("Error deleting book:", error);
    }
  };

  const csvHeaders = [
    { label: "STT", key: "index" },
    { label: "Tên Sách", key: "title" },
    { label: "Tác Giả", key: "authors" },
    { label: "Nhà Xuất Bản", key: "publisher" },
    { label: "Năm Xuất Bản", key: "publication_year" },
    { label: "Thể Loại", key: "category_name" },
    { label: "Số Lượng", key: "total_quantity" },
  ];

  const csvData = books.map((book, index) => ({
    index: index + 1,
    title: book.title,
    authors: book.authors?.join(", ") || "Chưa cập nhật",
    publisher: book.publisher_name || "Chưa cập nhật",
    publication_year: book.publication_year,
    category_name: book.category_name,
    total_quantity: book.total_quantity,
  }));

  return (
    <Stack spacing={2} sx={{ padding: 4 }}>
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
      <Typography variant="h4" textAlign="center" fontWeight="bold">
        Quản Lý Sách Trong Thư Viện
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tựa đề"
            fullWidth
            value={filters.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Thể loại</InputLabel>
            <Select
              label="Thể loại"
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
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
            fullWidth
            value={filters.authorName}
            onChange={(e) => handleFilterChange("authorName", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Năm xuất bản</InputLabel>
            <Select
              label="Năm xuất bản"
              value={filters.publicationYear}
              onChange={(e) =>
                handleFilterChange("publicationYear", e.target.value)
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
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleOpenModal()}
        >
          Thêm sách mới
        </Button>
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`DanhSachSach_${new Date().toISOString()}.csv`}
          style={{ textDecoration: "none" }}
        >
          <Button variant="contained" color="secondary">
            Xuất CSV
          </Button>
        </CSVLink>
      </Stack>
      <Grid container spacing={2}>
        {books.length > 0 ? (
          books.map((book) => (
            <Grid item xs={12} sm={6} md={3} key={book.id}>
              <Card>
                <CardMedia
                  component="img"
                  style={{ height: 200, objectFit: "cover" }}
                  image={`http://localhost:8080/api/images/${book.image}`}
                  alt={book.title}
                />
                <CardContent sx={{ paddingBottom: "4px" }}>
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
                    Số lượng: {book.total_quantity}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Số lượng có sẵn: {book.available_quantity}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                >
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      onClick={() => handleOpenModal(book.id)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      Xóa
                    </Button>
                  </CardActions>
                </CardActions>

                <Stack alignItems="center" mb={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    onClick={() => handleOpenCopyModal(book)}
                  >
                    Xem tất cả đầu sách
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography textAlign="center">Không tìm thấy kết quả!</Typography>
          </Grid>
        )}
      </Grid>
      <Stack alignItems="center" sx={{ marginTop: 3 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>
      <BookModal
        open={isModalOpen}
        onClose={handleCloseModal}
        bookId={selectedBookId}
        onSave={fetchBooks}
        onShowToast={showToast}
      />
      <BookCopyManagementModal
        open={isCopyModalOpen}
        onClose={handleCloseCopyModal}
        bookId={selectedBookId}
        bookTitle={selectedBookTitle}
        onShowToast={showToast}
      />
    </Stack>
  );
}
