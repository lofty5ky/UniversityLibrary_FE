import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { CSVLink } from "react-csv";

export default function BorrowManagement() {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [filters, setFilters] = useState({
    userName: "",
    email: "",
    copyId: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const csvHeaders = [
    { label: "STT", key: "index" },
    { label: "Tên Người Mượn", key: "user_name" },
    { label: "Email", key: "email" },
    { label: "Mã Đầu Sách", key: "copy_id" },
    { label: "Tựa Đề Sách", key: "book_title" },
    { label: "Ngày Mượn", key: "borrow_date" },
    { label: "Hạn Trả", key: "due_date" },
    { label: "Ngày Trả", key: "return_date" },
    { label: "Tình Trạng Sách", key: "book_condition" },
    { label: "Trạng Thái", key: "status" },
  ];

  const csvData = borrowRecords.map((record, index) => ({
    index: (page - 1) * 10 + index + 1,
    user_name: record.user_name,
    email: record.email,
    copy_id: record.copy_id,
    book_title: record.book_title,
    borrow_date: record.borrow_date,
    due_date: record.due_date,
    return_date: record.return_date || "Chưa Trả",
    book_condition: record.book_condition,
    status: record.status,
  }));

  useEffect(() => {
    fetchBorrowRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchBorrowRecords = async (filterValues) => {
    try {
      const response = await axios.get("/api/borrow-records/search", {
        params: {
          ...filterValues,
          page: page - 1,
          size: 10,
        },
      });
      setBorrowRecords(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showToast("Lỗi khi tải dữ liệu mượn sách", "error");
      console.error("Error fetching borrow records:", error);
    }
  };

  const showToast = (message, severity) => {
    setToast({ open: true, message, severity });
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleReturnBook = async (recordId) => {
    try {
      await axios.put(`/api/borrow-records/${recordId}/return`);
      fetchBorrowRecords();
      showToast("Xác nhận đã trả sách thành công!", "success");
    } catch (error) {
      showToast("Lỗi khi trả sách. Vui lòng thử lại.", "error");
      console.error("Error updating borrow record:", error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await axios.delete(`/api/borrow-records/${recordId}`);
      fetchBorrowRecords();
      showToast("Xóa bản ghi thành công!", "success");
    } catch (error) {
      showToast("Lỗi khi xóa bản ghi. Vui lòng thử lại.", "error");
      console.error("Error deleting borrow record:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
      case "OVERDUE":
        return { label: "Quá Hạn", color: "red", fontWeight: "bold" };
      case "BORROWED":
        return { label: "Đang Mượn", color: "orange", fontWeight: "bold" };
      case "RETURNED":
        return { label: "Đã Trả", color: "green", fontWeight: "bold" };
      default:
        return { label: "Không Xác Định", color: "gray", fontWeight: "normal" };
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        marginBottom={3}
      >
        Quản Lý Mượn Sách
      </Typography>

      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Tên Người Mượn"
            name="userName"
            value={filters.userName}
            onChange={handleFilterChange}
            size="small"
            sx={{ width: 300 }}
          />
          <TextField
            label="Email Người Mượn"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            size="small"
            sx={{ width: 300 }}
          />
          <TextField
            label="Mã Đầu Sách"
            name="copyId"
            value={filters.copyId}
            onChange={handleFilterChange}
            size="small"
            sx={{ width: 150 }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Từ Ngày"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 300 }}
          />
          <TextField
            label="Đến Ngày"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 300 }}
          />
          <FormControl sx={{ width: 200 }} size="small">
            <InputLabel>Trạng Thái</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Trạng Thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="BORROWED">Đang Mượn</MenuItem>
              <MenuItem value="RETURNED">Đã Trả</MenuItem>
              <MenuItem value="OVERDUE">Quá Hạn</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-start">
          <Button
            variant="contained"
            onClick={() => {
              fetchBorrowRecords(filters);
            }}
          >
            Tìm Kiếm
          </Button>
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`borrow_records_${Date.now()}.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="success">
              Xuất CSV
            </Button>
          </CSVLink>
          <CSVLink
            data={csvData.filter((record) => record.status !== "RETURNED")}
            headers={csvHeaders}
            filename={`sach_chua_tra_${Date.now()}.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="warning">
              Xuất sách chưa trả
            </Button>
          </CSVLink>
        </Stack>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{ overflowX: "auto", marginTop: "20px" }}
      >
        <Table sx={{ minWidth: "1500px" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>STT</TableCell>
              <TableCell sx={{ width: 200 }}>Tên Người Mượn</TableCell>
              <TableCell sx={{ width: 180 }}>Email</TableCell>
              <TableCell sx={{ width: 140 }}>Mã Đầu Sách</TableCell>
              <TableCell sx={{ width: 260 }}>Tựa Đề Sách</TableCell>
              <TableCell sx={{ minWidth: 130 }}>Ngày Mượn</TableCell>
              <TableCell sx={{ minWidth: 130 }}>Hạn Trả</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Ngày Trả</TableCell>
              <TableCell sx={{ width: 180 }}>Tình Trạng Sách</TableCell>
              <TableCell sx={{ width: 160 }}>Trạng Thái</TableCell>
              <TableCell sx={{ width: 240 }}>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {borrowRecords.length > 0 ? (
              borrowRecords.map((record, index) => (
                <TableRow key={record.record_id}>
                  <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                  <TableCell>{record.user_name}</TableCell>
                  <TableCell
                    sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                  >
                    {record.email}
                  </TableCell>
                  <TableCell>{record.copy_id}</TableCell>
                  <TableCell
                    sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                  >
                    {record.book_title}
                  </TableCell>
                  <TableCell>{formatDate(record.borrow_date)}</TableCell>
                  <TableCell>{formatDate(record.due_date)}</TableCell>
                  <TableCell>
                    {record.return_date
                      ? formatDate(record.return_date)
                      : "Chưa Trả"}
                  </TableCell>
                  <TableCell>
                    {translateCondition(record.book_condition)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: translateStatus(record.status).color,
                      fontWeight: translateStatus(record.status).fontWeight,
                    }}
                  >
                    {translateStatus(record.status).label}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {record.status !== "RETURNED" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleReturnBook(record.record_id)}
                        >
                          Đã trả?
                        </Button>
                      )}
                      {record.status === "RETURNED" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteRecord(record.record_id)}
                        >
                          Xóa
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  Không tìm thấy kết quả phù hợp
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="center" marginTop={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
