import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Box,
  TextField,
  Stack,
  Pagination,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import BookCopySelectionModal from "../../components/BookCopySelectionModal";
import axios from "axios";
import { CSVLink } from "react-csv";

const ReservationRequest = () => {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("info");

  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const showToast = (message, severity = "info") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`/api/reservations`, {
        params: {
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          page: page - 1,
          size: 10,
        },
      });
      setReservations(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleReject = async (reservationId) => {
    setLoadingReject(true);
    try {
      await axios.put(`/api/reservations/${reservationId}/cancel`);
      fetchReservations();
      showToast("Yêu cầu đã được từ chối!", "warning");
    } catch (error) {
      console.error("Error rejecting reservation:", error);
      showToast("Không thể từ chối yêu cầu. Vui lòng thử lại.", "error");
    } finally {
      setLoadingReject(false);
    }
  };

  const handleDelete = async (reservationId) => {
    try {
      await axios.delete(`/api/reservations/${reservationId}`);
      fetchReservations();
      showToast("Yêu cầu đã được xóa thành công!", "success");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      showToast("Không thể xóa yêu cầu. Vui lòng thử lại.", "error");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const csvHeaders = [
    { label: "STT", key: "index" },
    { label: "Tên người đặt", key: "userName" },
    { label: "Email", key: "email" },
    { label: "Tựa đề", key: "bookTitle" },
    { label: "Mã đầu sách", key: "approvedCopyId" },
    { label: "Thời gian", key: "reservationDate" },
    { label: "Trạng thái", key: "status" },
  ];

  const csvData = reservations.map((reservation, index) => ({
    index: (page - 1) * 10 + index + 1,
    userName: reservation.user_name,
    email: reservation.email,
    bookTitle: reservation.book_title,
    approvedCopyId: reservation.approved_copy_id || "-",
    reservationDate: formatDate(reservation.reservation_date),
    status:
      reservation.status === "PENDING"
        ? "Chờ duyệt"
        : reservation.status === "FULFILLED"
        ? "Chấp nhận"
        : "Từ chối",
  }));

  const handleApprove = (reservationId, bookId) => {
    console.log(bookId);
    setLoadingApprove(true);
    setSelectedReservation({ reservationId, bookId });
    setIsModalOpen(true);
    setLoadingApprove(false);
  };

  const handleSelectBookCopy = async (copyId) => {
    try {
      const { reservationId } = selectedReservation;
      await axios.put(`/api/reservations/${reservationId}`, {
        status: "FULFILLED",
        approved_copy_id: copyId,
      });
      setIsModalOpen(false);
      fetchReservations();
      showToast("Yêu cầu đã được duyệt!", "success");
    } catch (error) {
      console.error("Error approving reservation:", error);
      alert("Không thể phê duyệt yêu cầu. Vui lòng thử lại.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastOpen(false)}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        marginBottom={3}
      >
        Quản Lý Yêu Cầu Đặt Mượn Sách
      </Typography>

      <Stack spacing={2} marginBottom={2}>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ width: 200 }} size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="FULFILLED">Chấp nhận</MenuItem>
              <MenuItem value="CANCELLED">Từ chối</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Từ Ngày"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 300 }}
            size="small"
          />
          <TextField
            label="Đến Ngày"
            type="date"
            size="small"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 300 }}
          />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`reservations_${Date.now()}.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="success">
              Xuất CSV
            </Button>
          </CSVLink>
        </Stack>
      </Stack>

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>STT</TableCell>
              <TableCell sx={{ width: 160 }}>Tên người đặt</TableCell>
              <TableCell sx={{ width: 160 }}>Email</TableCell>
              <TableCell sx={{ width: 200 }}>Tựa đề</TableCell>
              <TableCell>Mã đầu sách</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.length > 0 ? (
              reservations.map((reservation, index) => (
                <TableRow key={reservation.id}>
                  <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                  <TableCell>{reservation.user_name}</TableCell>
                  <TableCell>{reservation.email}</TableCell>
                  <TableCell sx={{ maxWidth: 300, wordWrap: "break-word" }}>
                    {reservation.book_title}
                  </TableCell>
                  <TableCell>{reservation.approved_copy_id || "-"}</TableCell>
                  <TableCell>
                    {formatDate(reservation.reservation_date)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color:
                        reservation.status === "PENDING"
                          ? "purple"
                          : reservation.status === "FULFILLED"
                          ? "green"
                          : "red",
                    }}
                  >
                    {reservation.status === "PENDING" && "Chờ duyệt"}
                    {reservation.status === "FULFILLED" && "Đã duyệt"}
                    {reservation.status === "CANCELLED" && "Từ chối"}
                  </TableCell>
                  <TableCell>
                    {reservation.status === "PENDING" && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() =>
                          handleApprove(reservation.id, reservation.book_id)
                        }
                        sx={{ marginRight: 1 }}
                        disabled={loadingApprove} 
                      >
                        {loadingApprove ? (
                          <CircularProgress size={20} sx={{ color: "white" }} />
                        ) : (
                          "Duyệt"
                        )}
                      </Button>
                    )}
                    {reservation.status === "PENDING" && (
                      <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        onClick={() => handleReject(reservation.id)}
                        sx={{ marginRight: 1 }}
                        disabled={loadingReject}
                      >
                        {loadingReject ? (
                          <CircularProgress size={20} sx={{ color: "white" }} />
                        ) : (
                          "Từ chối"
                        )}
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(reservation.id)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không tìm thấy kết quả phù hợp!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack direction="row" justifyContent="center" marginTop={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>

      <BookCopySelectionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookId={selectedReservation?.bookId}
        onSelect={handleSelectBookCopy}
      />
    </Box>
  );
};

export default ReservationRequest;
