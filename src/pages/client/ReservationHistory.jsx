import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
} from "@mui/material";
import axios from "axios";

const columns = [
  { id: "stt", label: "STT", minWidth: 50, align: "center" },
  { id: "name", label: "Tên sách", minWidth: 340 },
  {
    id: "reservationDate",
    label: "Ngày đặt sách",
    minWidth: 180,
    align: "center",
  },
  { id: "status", label: "Trạng thái", minWidth: 150, align: "center" },
];

const ReservationHistory = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      const response = await axios.get(
        `http://localhost:8080/api/reservations/user/${userId}`,
        {
          params: {
            page,
            size: rowsPerPage,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { content, totalElements } = response.data;
      setRows(
        content.map((item) => ({
          id: item.id,
          name: item.book_title,
          reservationDate: new Date(item.reservation_date).toLocaleDateString(
            "vi-VN"
          ),
          status:
            item.status === "PENDING"
              ? "Chờ duyệt"
              : item.status === "FULFILLED"
              ? "Đã duyệt"
              : "Bị từ chối",
        }))
      );
      setTotalCount(totalElements);
    } catch (error) {
      console.error("Error fetching reservation history:", error);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight="bold"
        gutterBottom
        sx={{ marginBottom: 2 }}
      >
        Yêu Cầu Mượn Sách
      </Typography>

      {rows.length > 0 ? (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        minWidth: column.minWidth,
                        fontWeight: "bold",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="center">{row.reservationDate}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status}
                        color={
                          row.status === "Chờ duyệt"
                            ? "warning"
                            : row.status === "Đã duyệt"
                            ? "success"
                            : "error"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang"
          />
        </Paper>
      ) : (
        <Box sx={{ textAlign: "center", marginTop: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Bạn chưa tạo yêu cầu mượn sách nào
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReservationHistory;
