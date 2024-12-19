import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import axios from "axios";

export default function ViolationHistory() {
  const [violations, setViolations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 10;

  useEffect(() => {
    fetchViolations(page - 1);
  }, [page]);

  const fetchViolations = async (page) => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;
      const response = await axios.get(
        `http://localhost:8080/api/violations/user/${userId}?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;

      setViolations(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching violations:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatViolationType = (type) => {
    switch (type) {
      case "LATE_RETURN":
        return "Trả sách trễ";
      case "DAMAGED_BOOK":
        return "Sách bị hư hỏng";
      case "LOST_BOOK":
        return "Sách bị mất";
      default:
        return "Không xác định";
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
        Vi Phạm
      </Typography>

      {violations.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell align="center" sx={{ maxWidth: 50 }}>
                    STT
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 80 }}>
                    Ngày vi phạm
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 80 }}>
                    Loại vi phạm
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 300 }}>
                    Mô tả
                  </TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Ngày giải quyết</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {violations.map((violation, index) => (
                  <TableRow key={violation.id}>
                    <TableCell align="center">
                      {(page - 1) * size + index + 1}
                    </TableCell>
                    <TableCell align="center">
                      {formatDate(violation.violationDate)}
                    </TableCell>
                    <TableCell align="center">
                      {formatViolationType(violation.violationType)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        maxWidth: 300,
                        textOverflow: "ellipsis",
                      }}
                    >
                      {violation.description}
                    </TableCell>
                    <TableCell align="center">
                      {violation.resolved ? (
                        <Typography
                          variant="body2"
                          sx={{ color: "green", fontWeight: "bold" }}
                        >
                          Đã giải quyết
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "red", fontWeight: "bold" }}
                        >
                          Chưa giải quyết
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {violation.resolved && violation.resolveAt
                        ? formatDate(violation.resolveAt)
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      ) : (
        <Typography
          variant="h6"
          textAlign="center"
          marginTop={4}
          color="text.secondary"
        >
          Bạn không có vi phạm nào!
        </Typography>
      )}
    </Box>
  );
}
