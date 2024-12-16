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
  Modal,
  TextField,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { validateAuthor } from "../../utils/validators";
import { toast, ToastContainer } from "react-toastify";
import { CSVLink } from "react-csv";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    biography: "",
    birth_date: "",
  });

  const headers = [
    { label: "STT", key: "stt" },
    { label: "Tên Tác Giả", key: "name" },
    { label: "Tiểu Sử", key: "biography" },
    { label: "Ngày Sinh", key: "birth_date" },
  ];

  const csvData = authors.map((author, index) => ({
    stt: index + 1,
    name: author.name,
    biography: author.biography,
    birth_date: dayjs(author.birth_date).format("DD/MM/YYYY"),
  }));

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    biography: "",
    birth_date: "",
  });
  const [currentAuthor, setCurrentAuthor] = useState({
    authorId: "",
    name: "",
    biography: "",
    birth_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteAuthorId, setDeleteAuthorId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchAuthors = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/authors?page=${page - 1}&size=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAuthors(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách tác giả: " + err.message);
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchAuthors(currentPage);
  }, [currentPage, fetchAuthors]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenAddModal = () => setShowAddModal(true);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewAuthor({ name: "", biography: "", birth_date: "" });
    setErrors({ name: "", biography: "", birth_date: "" });
  };

  const handleOpenEditModal = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/authors/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const author = response.data;
      setCurrentAuthor({
        authorId: author.authorId,
        name: author.name,
        biography: author.biography,
        birth_date: dayjs(author.birth_date).format("YYYY-MM-DD"),
      });
      setShowEditModal(true);
    } catch (err) {
      toast.error("Không thể tải thông tin tác giả: " + err.message);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentAuthor({ authorId: "", name: "", biography: "", birth_date: "" });
    setErrors({ name: "", biography: "", birth_date: "" });
  };

  const handleAddAuthor = async () => {
    const { isValid, errors } = validateAuthor(newAuthor);
    if (isValid) {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/authors`,
          {
            name: newAuthor.name,
            biography: newAuthor.biography,
            birth_date: newAuthor.birth_date,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAuthors((prev) => [...prev, response.data]);
        handleCloseAddModal();
        toast.success("Thêm tác giả thành công!");
      } catch (err) {
        toast.error("Thêm tác giả thất bại: " + err.message);
      }
    } else {
      setErrors(errors);
    }
  };

  const handleUpdateAuthor = async () => {
    const { isValid, errors } = validateAuthor(currentAuthor);
    if (isValid) {
      try {
        const response = await axios.put(
          `http://localhost:8080/api/authors/${currentAuthor.authorId}`,
          {
            name: currentAuthor.name,
            biography: currentAuthor.biography,
            birth_date: currentAuthor.birth_date,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAuthors((prev) =>
          prev.map((author) =>
            author.authorId === author.authorId ? response.data : author
          )
        );
        handleCloseEditModal();
        toast.success("Cập nhật tác giả thành công!");
      } catch (err) {
        toast.error("Cập nhật tác giả thất bại: " + err.message);
      }
    } else {
      setErrors(errors);
    }
  };

  const handleOpenDeleteDialog = (authorId) => {
    setDeleteAuthorId(authorId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteAuthorId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/authors/${deleteAuthorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAuthors((prev) =>
        prev.filter((author) => author.authorId !== deleteAuthorId)
      );
      handleCloseDeleteDialog();
      toast.success("Xóa tác giả thành công!");
    } catch (err) {
      toast.error("Xóa tác giả thất bại: " + err.message);
    }
  };

  if (loading) return <Typography>Đang tải danh sách tác giả...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={1} textAlign="center">
        Tác Giả
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
          sx={{ mr: 2 }}
        >
          Thêm Tác Giả
        </Button>
        <CSVLink
          data={csvData}
          headers={headers}
          filename="DanhSachTacGia.csv"
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          <Button variant="contained" color="success">
            Xuất CSV
          </Button>
        </CSVLink>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ maxWidth: 50 }}>STT</TableCell>
                <TableCell
                  sx={{
                    maxWidth: 200,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Tên Tác Giả
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 300,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Tiểu Sử
                </TableCell>
                <TableCell sx={{ maxWidth: 100 }}>Ngày Sinh</TableCell>
                <TableCell align="center" sx={{ maxWidth: 150 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {authors.map((author, index) => (
                <TableRow key={author.authorId}>
                  <TableCell sx={{ maxWidth: 50 }}>
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {author.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {author.biography}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100 }}>
                    {dayjs(author.birth_date).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 150 }}>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="info"
                      onClick={() => handleOpenEditModal(author.authorId)}
                      sx={{ marginRight: 1 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(author.authorId)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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

      <Modal open={showAddModal} onClose={handleCloseAddModal}>
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
          <Stack spacing={2}>
            <Typography variant="h6" textAlign="center">
              Thêm Tác Giả
            </Typography>
            <TextField
              label="Tên Tác Giả"
              variant="outlined"
              name="name"
              value={newAuthor.name}
              onChange={(e) =>
                setNewAuthor((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Tiểu Sử"
              variant="outlined"
              name="biography"
              value={newAuthor.biography}
              onChange={(e) =>
                setNewAuthor((prev) => ({ ...prev, biography: e.target.value }))
              }
              error={!!errors.biography}
              helperText={errors.biography}
              multiline
              rows={5}
              fullWidth
            />
            <TextField
              label="Ngày Sinh"
              variant="outlined"
              name="birth_date"
              type="date"
              value={newAuthor.birth_date}
              onChange={(e) =>
                setNewAuthor((prev) => ({
                  ...prev,
                  birth_date: e.target.value,
                }))
              }
              error={!!errors.birth_date}
              helperText={errors.birth_date}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddAuthor}
              >
                Thêm
              </Button>
              <Button variant="outlined" onClick={handleCloseAddModal}>
                Đóng
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <Modal open={showEditModal} onClose={handleCloseEditModal}>
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
          <Stack spacing={2}>
            <Typography variant="h6" textAlign="center">
              Chỉnh Sửa Tác Giả
            </Typography>
            <TextField
              label="Tên Tác Giả"
              variant="outlined"
              name="name"
              value={currentAuthor.name}
              onChange={(e) =>
                setCurrentAuthor((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Tiểu Sử"
              variant="outlined"
              name="biography"
              value={currentAuthor.biography}
              onChange={(e) =>
                setCurrentAuthor((prev) => ({
                  ...prev,
                  biography: e.target.value,
                }))
              }
              error={!!errors.biography}
              helperText={errors.biography}
              multiline
              rows={5}
              fullWidth
            />
            <TextField
              label="Ngày Sinh"
              variant="outlined"
              name="birth_date"
              type="date"
              value={currentAuthor.birth_date}
              onChange={(e) =>
                setCurrentAuthor((prev) => ({
                  ...prev,
                  birth_date: e.target.value,
                }))
              }
              error={!!errors.birth_date}
              helperText={errors.birth_date}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateAuthor}
              >
                Cập Nhật
              </Button>
              <Button variant="outlined" onClick={handleCloseEditModal}>
                Đóng
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xóa Tác Giả</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tác giả này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              backgroundColor: "red",
              color: "white",
              "&:hover": {
                backgroundColor: "darkred",
              },
            }}
          >
            Xác nhận
          </Button>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              backgroundColor: "gray",
              color: "white",
              "&:hover": {
                backgroundColor: "darkgray",
              },
            }}
          >
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-center" autoClose={3000} />
    </Box>
  );
};

export default AuthorList;
