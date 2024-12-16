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
import { validateCategory } from "../../utils/validators.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { CSVLink } from "react-csv";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [currentCategory, setCurrentCategory] = useState({
    id: "",
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  const [addModalError, setAddModalError] = useState("");
  const [editModalError, setEditModalError] = useState("");
  const [deleteModalError, setDeleteModalError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const headers = [
    { label: "STT", key: "stt" },
    { label: "Tên Thể Loại", key: "name" },
    { label: "Mô Tả", key: "description" },
  ];

  const csvData = categories.map((category, index) => ({
    stt: index + 1,
    name: category.name,
    description: category.description,
  }));

  const token = localStorage.getItem("token");

  const fetchCategories = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/book-categories?page=${page - 1}&size=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách thể loại: " + err.message);
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage, fetchCategories]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddModalError("");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewCategory({ name: "", description: "" });
    setErrors({ name: "", description: "" });
    setAddModalError("");
  };

  const handleOpenEditModal = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/book-categories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentCategory(response.data);
      setShowEditModal(true);
      setEditModalError("");
    } catch (err) {
      setEditModalError("Không thể tải thông tin thể loại: " + err.message);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentCategory({ id: "", name: "", description: "" });
    setErrors({ name: "", description: "" });
    setEditModalError("");
  };

  const handleAddCategory = async () => {
    const { isValid, errors: validationErrors } = validateCategory(newCategory);
    if (isValid) {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/book-categories",
          {
            name: newCategory.name,
            description: newCategory.description,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories((prev) => [...prev, response.data]);
        toast.success("Thêm thể loại thành công!");
        handleCloseAddModal();
      } catch (err) {
        if (err.response && err.response.data) {
          setAddModalError(err.response.data);
        } else {
          setAddModalError("Thêm thể loại thất bại: " + err.message);
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleUpdateCategory = async () => {
    const { isValid, errors: validationErrors } =
      validateCategory(currentCategory);
    if (isValid) {
      try {
        const response = await axios.put(
          `http://localhost:8080/api/book-categories/${currentCategory.id}`,
          {
            name: currentCategory.name,
            description: currentCategory.description,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories((prev) =>
          prev.map((cate) =>
            cate.id === currentCategory.id ? response.data : cate
          )
        );
        handleCloseEditModal();
        toast.success("Cập nhật thông tin thành công!");
      } catch (err) {
        if (err.response && err.response.data) {
          setEditModalError(err.response.data);
        } else {
          setEditModalError("Cập nhật thất bại: " + err.message);
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleOpenDeleteDialog = (categoryId) => {
    setDeleteCategoryId(categoryId);
    setDeleteDialogOpen(true);
    setDeleteModalError("");
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteCategoryId(null);
    setDeleteModalError("");
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/book-categories/${deleteCategoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories((prev) =>
        prev.filter((cate) => cate.id !== deleteCategoryId)
      );
      toast.success("Xóa thể loại thành công!");
      handleCloseDeleteDialog();
    } catch (err) {
      if (err.response && err.response.data) {
        setDeleteModalError(err.response.data);
      } else {
        console.log(err.response);
        setDeleteModalError("Xóa thể loại thất bại: có ràng buộc với sách");
      }
    }
  };

  if (loading) return <Typography>Đang tải danh sách thể loại...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={1} textAlign="center">
        Thể Loại
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
          sx={{ mr: 2 }}
        >
          Thêm Thể Loại
        </Button>
        <CSVLink
          data={csvData}
          headers={headers}
          filename="DanhSachTheLoai.csv"
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
                  Tên Thể Loại
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 300,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Mô Tả
                </TableCell>
                <TableCell align="center" sx={{ maxWidth: 150 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell sx={{ maxWidth: 50 }}>
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {category.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {category.description}
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 150 }}>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="info"
                      onClick={() => handleOpenEditModal(category.id)}
                      sx={{ marginRight: 1 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(category.id)}
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

      <ToastContainer position="top-center" autoClose={2000} />

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
              Thêm Thể Loại
            </Typography>
            <TextField
              label="Tên Thể Loại"
              variant="outlined"
              name="name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Mô Tả"
              variant="outlined"
              name="description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={5}
              fullWidth
            />
            {addModalError && (
              <Typography color="error" textAlign="center">
                {addModalError}
              </Typography>
            )}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddCategory}
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
              Chỉnh Sửa Thể Loại
            </Typography>
            <TextField
              label="Tên Thể Loại"
              variant="outlined"
              name="name"
              value={currentCategory.name}
              onChange={(e) =>
                setCurrentCategory((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Mô Tả"
              variant="outlined"
              name="description"
              value={currentCategory.description}
              onChange={(e) =>
                setCurrentCategory((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={5}
              fullWidth
            />
            {editModalError && (
              <Typography color="error" textAlign="center">
                {editModalError}
              </Typography>
            )}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateCategory}
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
        <DialogTitle>Xóa Thể Loại</DialogTitle>
        <DialogContent>
          {deleteModalError && (
            <Typography color="error" textAlign="center" mb={2}>
              {deleteModalError}
            </Typography>
          )}
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thể loại này?
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
    </Box>
  );
}
