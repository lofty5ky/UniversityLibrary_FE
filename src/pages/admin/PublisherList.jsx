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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { CSVLink } from "react-csv";

// Các hàm validate
const validatePublisherName = (name) => {
  if (name.trim().length < 8) {
    return "Tên nhà xuất bản phải có ít nhất 8 ký tự.";
  }
  return "";
};

const validatePublisherAddress = (address) => {
  if (address.trim().length < 10) {
    return "Địa chỉ phải có ít nhất 10 ký tự.";
  }
  return "";
};

const validatePublisherContactInfo = (contactInfo) => {
  if (!/^\d{10}$/.test(contactInfo)) {
    return "Số điện thoại phải đủ 10 chữ số và chỉ chứa số.";
  }
  return "";
};

const validatePublisher = (publisher) => {
  const errors = {
    name: validatePublisherName(publisher.name),
    address: validatePublisherAddress(publisher.address),
    contact_info: validatePublisherContactInfo(publisher.contact_info),
  };

  const isValid = !errors.name && !errors.address && !errors.contact_info;
  return { isValid, errors };
};

export default function PublisherList() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [newPublisher, setNewPublisher] = useState({
    name: "",
    address: "",
    contact_info: "",
  });
  const [currentPublisher, setCurrentPublisher] = useState({
    id: "",
    name: "",
    address: "",
    contact_info: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    contact_info: "",
  });

  const [addModalError, setAddModalError] = useState("");
  const [editModalError, setEditModalError] = useState("");
  const [deleteModalError, setDeleteModalError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deletePublisherId, setDeletePublisherId] = useState(null);

  const csvHeaders = [
    { label: "STT", key: "stt" },
    { label: "Tên Nhà Xuất Bản", key: "name" },
    { label: "Địa Chỉ", key: "address" },
    { label: "Số Điện Thoại", key: "contact_info" },
  ];

  const csvData = publishers.map((publisher, index) => ({
    stt: (currentPage - 1) * 10 + index + 1,
    name: publisher.name,
    address: publisher.address,
    contact_info: publisher.contact_info,
  }));

  const token = localStorage.getItem("token");

  const fetchPublishers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/publishers?page=${page - 1}&size=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPublishers(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách nhà xuất bản: " + err.message);
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchPublishers(currentPage);
  }, [currentPage, fetchPublishers]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddModalError("");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewPublisher({ name: "", address: "", contact_info: "" });
    setErrors({ name: "", address: "", contact_info: "" });
    setAddModalError("");
  };

  const handleOpenEditModal = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/publishers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentPublisher(response.data);
      setShowEditModal(true);
      setEditModalError("");
      setErrors({ name: "", address: "", contact_info: "" });
    } catch (err) {
      setEditModalError("Không thể tải thông tin nhà xuất bản: " + err.message);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditModalError("");
    setCurrentPublisher({
      publisherId: "",
      name: "",
      address: "",
      contact_info: "",
    });
    setErrors({ name: "", address: "", contact_info: "" });
  };

  const handleAddPublisher = async () => {
    const { isValid, errors: validationErrors } =
      validatePublisher(newPublisher);
    if (isValid) {
      try {
        await axios.post(
          `http://localhost:8080/api/publishers`,
          {
            name: newPublisher.name,
            address: newPublisher.address,
            contact_info: newPublisher.contact_info,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        handleCloseAddModal();
        toast.success("Thêm nhà xuất bản thành công!");
        setTimeout(() => {
          fetchPublishers(currentPage);
        }, 1000);
      } catch (err) {
        if (err.response && err.response.data) {
          setAddModalError(err.response.data);
        } else {
          setAddModalError("Thêm nhà xuất bản thất bại: " + err.message);
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleUpdatePublisher = async () => {
    const { isValid, errors: validationErrors } =
      validatePublisher(currentPublisher);
    if (isValid) {
      try {
        const response = await axios.put(
          `http://localhost:8080/api/publishers/${currentPublisher.publisherId}`,
          {
            name: currentPublisher.name,
            address: currentPublisher.address,
            contact_info: currentPublisher.contact_info,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPublishers((prev) =>
          prev.map((publisher) =>
            publisher.publisherId === currentPublisher.publisherId
              ? response.data
              : publisher
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

  const handleOpenDeleteDialog = (publisherId) => {
    setDeletePublisherId(publisherId);
    setDeleteDialogOpen(true);
    setDeleteModalError("");
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletePublisherId(null);
    setDeleteModalError("");
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/publishers/${deletePublisherId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPublishers((prev) =>
        prev.filter((publisher) => publisher.publisherId !== deletePublisherId)
      );
      toast.success("Xóa nhà xuất bản thành công!");
      handleCloseDeleteDialog();
    } catch (err) {
      if (err.response && err.response.data) {
        setDeleteModalError(err.response.data);
      } else {
        console.log(err.response);
        setDeleteModalError("Xóa thất bại: có ràng buộc");
      }
    }
  };

  if (loading)
    return <Typography>Đang tải danh sách nhà xuất bản...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={1} textAlign="center">
        Nhà Xuất Bản
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
          sx={{ mr: 2 }}
        >
          Thêm Nhà Xuất Bản
        </Button>
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename="DanhSachNhaXuatBan.csv"
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
                  Tên Nhà Xuất Bản
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 200,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Địa Chỉ
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 150,
                  }}
                >
                  Số Điện Thoại
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    maxWidth: 150,
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {publishers.map((publisher, index) => (
                <TableRow key={publisher.publisherId}>
                  <TableCell sx={{ maxWidth: 50 }}>
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {publisher.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {publisher.address}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    {publisher.contact_info}
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 150 }}>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="info"
                      onClick={() => handleOpenEditModal(publisher.publisherId)}
                      sx={{ marginRight: 1 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        handleOpenDeleteDialog(publisher.publisherId)
                      }
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

      <ToastContainer position="top-center" autoClose={1000} />

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
              Thêm Nhà Xuất Bản
            </Typography>
            <TextField
              label="Tên Nhà Xuất Bản"
              variant="outlined"
              name="name"
              value={newPublisher.name}
              onChange={(e) =>
                setNewPublisher((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Địa Chỉ"
              variant="outlined"
              name="address"
              value={newPublisher.address}
              onChange={(e) =>
                setNewPublisher((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              error={!!errors.address}
              helperText={errors.address}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Số Điện Thoại"
              variant="outlined"
              name="contact_info"
              value={newPublisher.contact_info}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ cho phép nhập số
                setNewPublisher((prev) => ({ ...prev, contact_info: value }));
              }}
              error={!!errors.contact_info}
              helperText={errors.contact_info}
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
                onClick={handleAddPublisher}
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
              Chỉnh Sửa Nhà Xuất Bản
            </Typography>
            <TextField
              label="Tên Nhà Xuất Bản"
              variant="outlined"
              name="name"
              value={currentPublisher.name}
              onChange={(e) =>
                setCurrentPublisher((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Địa Chỉ"
              variant="outlined"
              name="address"
              value={currentPublisher.address}
              onChange={(e) =>
                setCurrentPublisher((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              error={!!errors.address}
              helperText={errors.address}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Số Điện Thoại"
              variant="outlined"
              name="contact_info"
              value={currentPublisher.contact_info}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ cho phép nhập số
                setCurrentPublisher((prev) => ({
                  ...prev,
                  contact_info: value,
                }));
              }}
              error={!!errors.contact_info}
              helperText={errors.contact_info}
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
                onClick={handleUpdatePublisher}
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
        <DialogTitle>Xóa Nhà Xuất Bản</DialogTitle>
        <DialogContent>
          {deleteModalError && (
            <Typography color="error" textAlign="center" mb={2}>
              {deleteModalError}
            </Typography>
          )}
          <DialogContentText>
            Bạn có chắc chắn muốn xóa nhà xuất bản này?
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
