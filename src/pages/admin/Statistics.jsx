import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/MenuBook";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";

const DashboardCard = ({ icon, value, label, backgroundColor }) => {
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 2,
        borderRadius: 2,
        backgroundColor: backgroundColor,
        color: "#fff",
        width: 300,
        height: 120,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {value !== null ? (
            value
          ) : (
            <CircularProgress size={24} color="inherit" />
          )}
        </Typography>
        <Typography
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 2,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box sx={{ fontSize: 40 }}>{icon}</Box>
    </Card>
  );
};

export default function Statistics() {
  const [stats, setStats] = useState({
    members: null,
    totalBooks: null,
    totalBookCopies: null,
    borrowRecords: null,
    unreturnedBooks: null,
    violations: null,
    borrowedByMonth: [],
    violationTypeData: [],
    topBorrowedBooks: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          members,
          totalBooks,
          totalBookCopies,
          borrowRecords,
          unreturnedBooks,
          violations,
          borrowedByMonth,
          violationTypeData,
          topBorrowedBooks,
        ] = await Promise.all([
          axios.get("/api/users/count"),
          axios.get("/api/books/count"),
          axios.get("/api/book-copies/count"),
          axios.get("/api/borrow-records/count"),
          axios.get("/api/borrow-records/total-unreturned"),
          axios.get("/api/violations/count"),
          axios.get("/api/borrow-records/borrowed-by-month"),
          axios.get("/api/violations/type-ratio"),
          axios.get("/api/borrow-records/top-borrowed"),
        ]);

        const formattedBorrowedByMonth = borrowedByMonth.data.map((item) => ({
          month: `Tháng ${item.month}`,
          "Lượt mượn": item.count,
        }));

        const formattedViolationTypeData = violationTypeData.data.map(
          (item) => ({
            name: item.name,
            value: item.value,
          })
        );

        const formattedTopBooks = topBorrowedBooks.data.map((book) => ({
          id: book.bookId,
          title: book.title,
          image: book.bookImage,
          authors: book.authors ? book.authors.join(", ") : "N/A",
        }));

        setStats({
          members: members.data,
          totalBooks: totalBooks.data,
          totalBookCopies: totalBookCopies.data,
          borrowRecords: borrowRecords.data,
          unreturnedBooks: unreturnedBooks.data,
          violations: violations.data,
          borrowedByMonth: formattedBorrowedByMonth,
          violationTypeData: formattedViolationTypeData,
          topBorrowedBooks: formattedTopBooks,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  const COLORS = ["#FF4D4D", "#8B5E3C", "#FFC107"];

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        sx={{ color: "#333" }}
      >
        Thống kê thư viện
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={2}
        mb={4}
      >
        <DashboardCard
          icon={<PeopleIcon />}
          value={stats.members}
          label="Số thành viên"
          backgroundColor="#4CAF50"
        />
        <DashboardCard
          icon={<BookIcon />}
          value={stats.totalBooks}
          label="Số lượng sách"
          backgroundColor="#C2B280"
        />
        <DashboardCard
          icon={<BookIcon />}
          value={stats.totalBookCopies}
          label="Số lượng đầu sách"
          backgroundColor="#8B5E3C"
        />
        <DashboardCard
          icon={<EventNoteIcon />}
          value={stats.borrowRecords}
          label="Số lượt mượn sách"
          backgroundColor="#FF5722"
        />
        <DashboardCard
          icon={<AssignmentLateIcon />}
          value={stats.unreturnedBooks}
          label="Sách chưa được trả"
          backgroundColor="#F44336"
        />
        <DashboardCard
          icon={<AssignmentLateIcon />}
          value={stats.violations}
          label="Số vi phạm"
          backgroundColor="#D32F2F"
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" textAlign="center" gutterBottom>
            Số lượng sách mượn theo tháng
          </Typography>
          <Box sx={{ backgroundColor: "#FFF8DC", padding: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.borrowedByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Lượt mượn"
                  stroke="#8884d8"
                  activeDot={{ r: 12 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" textAlign="center" gutterBottom>
            Tỷ lệ các loại vi phạm
          </Typography>
          <Box sx={{ backgroundColor: "#FFF8DC", padding: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.violationTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {stats.violationTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        mt={2}
        mb={2}
        sx={{ color: "#333" }}
      >
        Lựa chọn hàng đầu
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {stats.topBorrowedBooks.map((book) => (
          <Grid item xs={12} sm={6} md={2.4} key={book.id}>
            <Card
              sx={{
                textAlign: "center",
                borderRadius: 2,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={`http://localhost:8080/api/images/${book.image}`}
                alt={book.title}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
              <CardContent>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: 2,
                  }}
                >
                  {book.title}
                </Typography>
                <Typography variant="body2">{book.authors}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
