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
  TextField,
  Stack,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Modal,
  Autocomplete,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import { CSVLink } from "react-csv";

export default function ViolationManagement() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editViolationId, setEditViolationId] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [newViolation, setNewViolation] = useState({
    user_id: "",
    email: "",
    name: "",
    description: "",
    violationDate: "",
    violationType: "",
    resolved: false,
  });

  const [filters, setFilters] = useState({
    resolved: "",
    violationType: "",
    startDate: "",
    endDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    resolved: "",
    violationType: "",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [actionDialog, setActionDialog] = useState({
    open: false,
    violationId: null,
    action: "",
    message: "",
  });

  const token = localStorage.getItem("token");

  const fetchViolations = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { resolved, violationType, startDate, endDate } = appliedFilters;

        const queryParams = new URLSearchParams();
        if (resolved !== "") queryParams.append("resolved", resolved);
        if (violationType) queryParams.append("violationType", violationType);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        queryParams.append("page", page - 1);
        queryParams.append("size", 10);

        const response = await axios.get(
          `http://localhost:8080/api/violations?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setViolations(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách vi phạm: " + err.message);
        setLoading(false);
      }
    },
    [appliedFilters, token]
  );

  const fetchEmails = async () => {
    try {
      let users = [];
      let page = 0;
      const size = 100;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await axios.get("http://localhost:8080/api/users", {
          params: { page, size },
          headers: { Authorization: `Bearer ${token}` },
        });

        users = [...users, ...response.data.content];
        hasNextPage = !response.data.last;
        page += 1;
      }

      setUserOptions(users);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const fetchViolationById = async (violationId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/violations/${violationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const {
        user_id,
        email,
        description,
        violationDate,
        violationType,
        resolved,
      } = response.data;

      setNewViolation({
        user_id,
        email,
        name: "",
        description,
        violationDate,
        violationType,
        resolved,
      });

      console.log(newViolation);
    } catch (error) {
      console.error("Error fetching violation details:", error);
      toast.error("Không thể tải thông tin vi phạm");
    }
  };

  useEffect(() => {
    fetchViolations(currentPage);
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchViolations]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleOpenActionDialog = (violationId, action) => {
    setActionDialog({
      open: true,
      violationId,
      action,
      message: `Bạn có chắc chắn muốn xóa vi phạm này?`,
    });
  };

  const handleCloseActionDialog = () => {
    setActionDialog({
      open: false,
      violationId: null,
      action: "",
      message: "",
    });
  };

  const handleConfirmAction = async () => {
    const { violationId, action } = actionDialog;
    try {
      if (action === "delete") {
        await axios.delete(
          `http://localhost:8080/api/violations/${violationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Xóa thành công!");
      }

      fetchViolations(currentPage);
      handleCloseActionDialog();
    } catch (err) {
      toast.error("Thao tác thất bại: " + err.message);
      handleCloseActionDialog();
    }
  };

  const handleOpenModal = (isEdit = false, violationId = null) => {
    setIsEditMode(isEdit);
    if (isEdit) {
      setEditViolationId(violationId);
      fetchViolationById(violationId);
    } else {
      setNewViolation({
        user_id: "",
        email: "",
        name: "",
        description: "",
        violationDate: "",
        violationType: "",
        resolved: false,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveViolation = async () => {
    if (!newViolation.user_id) {
      toast.error("Vui lòng chọn email!");
      return;
    }

    if (!newViolation.description || newViolation.description.length < 20) {
      toast.error("Chi tiết vi phạm phải có ít nhất 20 ký tự!");
      return;
    }

    if (!newViolation.violationDate) {
      toast.error("Vui lòng chọn ngày!");
      return;
    }

    const currentDate = dayjs();
    const violationDate = dayjs(newViolation.violationDate);

    if (!violationDate.isValid() || violationDate.isAfter(currentDate)) {
      toast.error("Ngày vi phạm không thể lớn hơn ngày hôm nay!");
      return;
    }

    if (!newViolation.violationType) {
      toast.error("Vui lòng chọn loại vi phạm!");
      return;
    }

    try {
      console.log(editViolationId);
      const url = isEditMode
        ? `http://localhost:8080/api/violations/${editViolationId}`
        : "http://localhost:8080/api/violations";
      const method = isEditMode ? "put" : "post";

      await axios[method](
        url,
        {
          user_id: newViolation.user_id,
          description: newViolation.description,
          violation_date: newViolation.violationDate,
          violation_type: newViolation.violationType,
          resolved: newViolation.resolved,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        isEditMode
          ? "Cập nhật vi phạm thành công!"
          : "Thêm vi phạm mới thành công!"
      );
      handleCloseModal();
      setTimeout(() => {
        fetchViolations(currentPage);
      }, 1500);
    } catch (err) {
      toast.error(
        isEditMode
          ? "Cập nhật vi phạm thất bại: " + err.message
          : "Thêm vi phạm thất bại: " + err.message
      );
    }
  };

  if (loading) return <Typography>Đang tải danh sách vi phạm...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={2} textAlign="center">
        Quản Lý Vi Phạm
      </Typography>

      <Stack spacing={2} mb={2}>
        <Stack direction="row" spacing={2}>
          <Select
            name="resolved"
            value={filters.resolved}
            onChange={handleFilterChange}
            size="small"
            displayEmpty
            renderValue={(selected) => {
              if (selected === "") return "Trạng thái";
              return selected === "true" ? "Đã Giải Quyết" : "Chưa Giải Quyết";
            }}
            sx={{ width: "20%" }}
          >
            <MenuItem value="">Tất Cả</MenuItem>
            <MenuItem value="true">Đã Giải Quyết</MenuItem>
            <MenuItem value="false">Chưa Giải Quyết</MenuItem>
          </Select>
          <Select
            name="violationType"
            value={filters.violationType}
            onChange={handleFilterChange}
            size="small"
            displayEmpty
            renderValue={(selected) => {
              if (selected === "") return "Loại vi phạm";
              return (
                {
                  LATE_RETURN: "Trả Muộn",
                  DAMAGED_BOOK: "Sách Hư Hỏng",
                  LOST_BOOK: "Sách Bị Mất",
                }[selected] || selected
              );
            }}
            sx={{ width: "20%" }}
          >
            <MenuItem value="">Tất Cả</MenuItem>
            <MenuItem value="LATE_RETURN">Trả Muộn</MenuItem>
            <MenuItem value="DAMAGED_BOOK">Sách Hư Hỏng</MenuItem>
            <MenuItem value="LOST_BOOK">Sách Bị Mất</MenuItem>
          </Select>
          <TextField
            label="Từ Ngày"
            variant="outlined"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: "20%" }}
          />
          <TextField
            label="Đến Ngày"
            variant="outlined"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: "20%" }}
          />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            sx={{ height: "40px", width: "10%" }}
          >
            Tìm Kiếm
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenModal(false)}
            sx={{ height: "40px", width: "15%" }}
          >
            Xử lý Vi Phạm Mới
          </Button>
          <CSVLink
            data={violations.map((violation, index) => ({
              STT: (currentPage - 1) * 10 + index + 1,
              "Email Người Vi Phạm": violation.email,
              "Chi Tiết Vi Phạm": violation.description,
              "Ngày Vi Phạm": dayjs(violation.violationDate).format(
                "DD/MM/YYYY"
              ),
              "Ngày Giải Quyết": violation.resolveAt
                ? dayjs(violation.resolveAt).format("DD/MM/YYYY")
                : "Chưa Giải Quyết",
              "Loại Vi Phạm":
                {
                  LATE_RETURN: "Trả Muộn",
                  DAMAGED_BOOK: "Hư Hỏng",
                  LOST_BOOK: "Mất Sách",
                }[violation.violationType] || "Không xác định",
              "Trạng Thái": violation.resolved
                ? "Đã Giải Quyết"
                : "Chưa Giải Quyết",
            }))}
            filename={`DanhSachViPham_${dayjs().format("YYYYMMDD_HHmmss")}.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              size="small"
              color="success"
              sx={{ height: "40px", width: 120 }}
            >
              Xuất CSV
            </Button>
          </CSVLink>
        </Stack>
      </Stack>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ maxWidth: 40 }}>STT</TableCell>
                <TableCell>Email Người Vi Phạm</TableCell>
                <TableCell
                  sx={{
                    maxWidth: 236,
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  }}
                >
                  Chi Tiết Vi Phạm
                </TableCell>
                <TableCell>Ngày Vi Phạm</TableCell>
                <TableCell>Ngày Giải Quyết</TableCell>
                <TableCell>Loại Vi Phạm</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {violations.length > 0 ? (
                violations.map((violation, index) => (
                  <TableRow key={violation.id}>
                    <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                    <TableCell>{violation.email}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 236,
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {violation.description}
                    </TableCell>
                    <TableCell>
                      {dayjs(violation.violationDate).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      {violation?.resolveAt
                        ? dayjs(violation.resolveAt).format("DD/MM/YYYY")
                        : "Chưa Giải Quyết"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {{
                        LATE_RETURN: "Trả Muộn",
                        DAMAGED_BOOK: "Hư Hỏng",
                        LOST_BOOK: "Mất Sách",
                      }[violation.violationType] || "Không xác định"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          violation.resolved
                            ? "Đã Giải Quyết"
                            : "Chưa Giải Quyết"
                        }
                        sx={{
                          backgroundColor: violation.resolved ? "green" : "red",
                          color: "white",
                          fontWeight: "bold",
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="column" spacing={1}>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenModal(true, violation.id)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            handleOpenActionDialog(violation.id, "delete")
                          }
                        >
                          Xóa
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không tìm thấy kết quả phù hợp!
                  </TableCell>
                </TableRow>
              )}
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

      {/* Dialog for confirming actions */}
      <Dialog open={actionDialog.open} onClose={handleCloseActionDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>{actionDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color="primary"
          >
            Xác Nhận
          </Button>
          <Button onClick={handleCloseActionDialog} variant="outlined">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for adding/editing a violation */}
      <Modal open={openModal} onClose={handleCloseModal}>
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
          <Typography variant="h6" mb={2}>
            {isEditMode ? "Chỉnh sửa Vi Phạm" : "Thêm Vi Phạm Mới"}
          </Typography>

          <Stack spacing={2}>
            <Autocomplete
              options={userOptions}
              getOptionLabel={(option) => option.email || ""}
              value={
                userOptions.find((user) => user.id === newViolation.user_id) ||
                null
              }
              onChange={(event, value) => {
                if (value) {
                  setNewViolation((prev) => ({
                    ...prev,
                    user_id: value.id,
                    email: value.email,
                  }));
                } else {
                  setNewViolation((prev) => ({
                    ...prev,
                    user_id: null,
                    email: "",
                  }));
                }
              }}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} label="Email" fullWidth />
              )}
              disabled={isEditMode}
            />

            {!isEditMode && newViolation.user_id && (
              <TextField
                label="Tên Thành Viên"
                value={
                  userOptions.find((user) => user.id === newViolation.user_id)
                    ?.name || ""
                }
                InputProps={{ readOnly: true }}
                fullWidth
              />
            )}

            <TextField
              label="Chi Tiết Vi Phạm"
              name="description"
              value={newViolation.description}
              onChange={(event) =>
                setNewViolation((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Ngày Vi Phạm"
              type="date"
              name="violationDate"
              value={newViolation.violationDate}
              onChange={(event) =>
                setNewViolation((prev) => ({
                  ...prev,
                  violationDate: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Select
              name="violationType"
              value={newViolation.violationType}
              onChange={(event) =>
                setNewViolation((prev) => ({
                  ...prev,
                  violationType: event.target.value,
                }))
              }
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Chọn Loại Vi Phạm</MenuItem>
              <MenuItem value="LATE_RETURN">Trả Muộn</MenuItem>
              <MenuItem value="DAMAGED_BOOK">Sách Hư Hỏng</MenuItem>
              <MenuItem value="LOST_BOOK">Mất Sách</MenuItem>
            </Select>

            <Select
              name="resolved"
              value={newViolation.resolved.toString()}
              onChange={(event) =>
                setNewViolation((prev) => ({
                  ...prev,
                  resolved: event.target.value === "true",
                }))
              }
              displayEmpty
              fullWidth
            >
              <MenuItem value="false">Chưa Giải Quyết</MenuItem>
              <MenuItem value="true">Đã Giải Quyết</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <Button variant="contained" onClick={handleSaveViolation}>
              {isEditMode ? "Lưu" : "Thêm"}
            </Button>
            <Button variant="outlined" onClick={handleCloseModal}>
              Hủy
            </Button>
          </Stack>
        </Box>
      </Modal>

      <ToastContainer position="top-center" autoClose={1000} />
    </Box>
  );
}
