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
  { id: "stt", label: "STT", minWidth: 50 },
  { id: "name", label: "Tên sách", minWidth: 170 },
  { id: "requestDate", label: "Ngày bắt đầu", minWidth: 150 },
  { id: "dueDate", label: "Ngày đến hạn", minWidth: 150 },
  { id: "returnDate", label: "Ngày trả sách thực tế", minWidth: 180 },
  { id: "status", label: "Trạng thái", minWidth: 150, align: "center" },
];

const BorrowHistory = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBorrowRecords = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      const response = await axios.get(
        `http://localhost:8080/api/borrow-records/search`,
        {
          params: {
            userId,
            page,
            size: rowsPerPage,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      const { content, totalElements } = response.data;
      setRows(
        content.map((item) => ({
          id: item.id,
          name: item.book_title,
          requestDate: new Date(item.borrow_date).toLocaleDateString("vi-VN"),
          dueDate: new Date(item.due_date).toLocaleDateString("vi-VN"),
          returnDate: item.return_date
            ? new Date(item.return_date).toLocaleDateString("vi-VN")
            : "Chưa trả",
          status:
            item.status === "BORROWED"
              ? "Đang mượn"
              : item.status === "RETURNED"
              ? "Đã trả"
              : "Quá hạn",
        }))
      );
      setTotalCount(totalElements);
    } catch (error) {
      console.error("Error fetching borrow records:", error);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchBorrowRecords();
  }, [fetchBorrowRecords]);

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
        Sách Đã Mượn
      </Typography>

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
              {rows.length > 0 ? (
                rows.map((row, index) => (
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
                    <TableCell align="center">
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.requestDate}</TableCell>
                    <TableCell>{row.dueDate}</TableCell>
                    <TableCell>{row.returnDate}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status}
                        color={
                          row.status === "Đang mượn"
                            ? "primary"
                            : row.status === "Đã trả"
                            ? "success"
                            : "error"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Bạn chưa có lịch sử mượn sách nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
    </Box>
  );
};

export default BorrowHistory;
