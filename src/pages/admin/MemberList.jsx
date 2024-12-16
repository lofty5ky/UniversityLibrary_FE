import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Pagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink } from "react-csv";

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "user",
  });
  const [roles, setRoles] = useState([]);

  const token = localStorage.getItem("token");

  const fetchMembers = async (page = 1) => {
    try {
      const queryParams = new URLSearchParams();
      const { name, email } = appliedFilters;

      if (name) queryParams.append("name", name);
      if (email) queryParams.append("email", email);
      queryParams.append("page", page - 1);
      queryParams.append("size", 10);

      const response = await axios.get(
        `http://localhost:8080/api/users/search?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Không thể tải danh sách thành viên!");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/role/all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Không thể tải danh sách vai trò!");
    }
  };

  useEffect(() => {
    fetchMembers(currentPage);
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDialogOpen = (member, action) => {
    setSelectedMember(member);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedMember(null);
    setDialogAction("");
  };

  const handleAddMemberDialogOpen = () => {
    setAddMemberDialogOpen(true);
  };

  const handleAddMemberDialogClose = () => {
    setAddMemberDialogOpen(false);
    setNewMember({
      name: "",
      email: "",
      password: "",
      phone_number: "",
      role: "user",
    });
  };

  const handleAddMember = async () => {
    const { name, email, password, phone_number, role } = newMember;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!name || name.length < 10) {
      toast.error("Họ và Tên phải có ít nhất 10 ký tự!");
      return;
    }

    if (!email || !emailRegex.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (!phone_number || !phoneRegex.test(phone_number)) {
      toast.error("Số điện thoại phải có đúng 10 chữ số!");
      return;
    }

    if (!role) {
      toast.error("Vui lòng chọn vai trò!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/users",
        { name, email, password, phone_number, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Thêm thành viên thành công!");
      fetchMembers(currentPage);
      handleAddMemberDialogClose();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Không thể thêm thành viên!");
    }
  };

  const handleMemberAction = async () => {
    if (!selectedMember) return;
    try {
      if (dialogAction === "lock") {
        await axios.put(
          `http://localhost:8080/api/users/${selectedMember.id}/lock`,
          { status: 0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Khóa thành viên thành công!");
      } else if (dialogAction === "unlock") {
        await axios.put(
          `http://localhost:8080/api/users/${selectedMember.id}/unlock`,
          { status: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Mở khóa thành viên thành công!");
      } else if (dialogAction === "delete") {
        await axios.delete(
          `http://localhost:8080/api/users/${selectedMember.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Xóa thành viên thành công!");
      }
      fetchMembers(currentPage);
    } catch (error) {
      console.error("Error performing action on member:", error);
      toast.error("Không thể thực hiện hành động!");
    }
    handleDialogClose();
  };

  const csvHeaders = [
    { label: "STT", key: "index" },
    { label: "Tên Thành Viên", key: "name" },
    { label: "Email Thành Viên", key: "email" },
    { label: "Số Điện Thoại", key: "phone_number" },
    { label: "Vai Trò", key: "roleName" },
    { label: "Tình Trạng", key: "statusLabel" },
  ];

  const csvData = members.map((member, index) => ({
    index: (currentPage - 1) * 10 + index + 1,
    name: member.name,
    email: member.email,
    phone_number: member.phone_number,
    roleName: member.roleName,
    statusLabel: member.status === 1 ? "Hoạt Động" : "Đang Khóa",
  }));

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        marginBottom={3}
      >
        Quản Lý Thành Viên
      </Typography>

      <Stack spacing={2} marginBottom={3}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Tên Thành Viên"
            name="name"
            size="small"
            value={filters.name}
            onChange={handleFilterChange}
            sx={{ width: 360 }}
          />
          <TextField
            label="Email Thành Viên"
            name="email"
            size="small"
            value={filters.email}
            onChange={handleFilterChange}
            sx={{ width: 320 }}
          />
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" onClick={handleSearch}>
            Tìm Kiếm
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMemberDialogOpen}
          >
            Thêm Thành Viên
          </Button>
          <CSVLink
            headers={csvHeaders}
            data={csvData}
            filename={`members_${new Date().toISOString()}.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="success">
              Xuất CSV
            </Button>
          </CSVLink>
        </Stack>
      </Stack>

      <ToastContainer position="top-center" autoClose={3000} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell align="center">STT</TableCell>
              <TableCell>Tên Thành Viên</TableCell>
              <TableCell>Email Thành Viên</TableCell>
              <TableCell>Số Điện Thoại</TableCell>
              <TableCell>Vai Trò</TableCell>
              <TableCell>Tình Trạng</TableCell>
              <TableCell align="center">Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length > 0 ? (
              members.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell align="center">
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone_number}</TableCell>
                  <TableCell>{member.roleName.toUpperCase()}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.status === 1 ? "Hoạt Động" : "Đang Khóa"}
                      color={member.status === 1 ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {member.roleName !== "admin" && (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor:
                              member.status === 1 ? "#D10000" : "green",
                            color: "white",
                            width: "100px",
                            "&:hover": {
                              backgroundColor:
                                member.status === 1 ? "darkred" : "darkgreen",
                            },
                          }}
                          onClick={() =>
                            handleDialogOpen(
                              member,
                              member.status === 1 ? "lock" : "unlock"
                            )
                          }
                        >
                          {member.status === 1 ? "Khóa" : "Mở Khóa"}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDialogOpen(member, "delete")}
                        >
                          Xóa
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không tìm thấy kết quả phù hợp
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === "delete"
              ? "Bạn có chắc chắn muốn xóa thành viên này?"
              : dialogAction === "lock"
              ? "Bạn có chắc chắn muốn khóa thành viên này?"
              : "Bạn có chắc chắn muốn mở khóa thành viên này?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button
            onClick={handleMemberAction}
            variant="contained"
            color={dialogAction === "delete" ? "error" : "primary"}
          >
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addMemberDialogOpen} onClose={handleAddMemberDialogClose}>
        <DialogTitle>Thêm Thành Viên Mới</DialogTitle>
        <DialogContent sx={{ width: 360 }}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Họ và Tên"
              name="name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={newMember.email}
              onChange={(e) =>
                setNewMember((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Mật Khẩu"
              type="password"
              name="password"
              value={newMember.password}
              onChange={(e) =>
                setNewMember((prev) => ({ ...prev, password: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Số Điện Thoại"
              name="phone_number"
              value={newMember.phone_number}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setNewMember((prev) => ({ ...prev, phone_number: value }));
                }
              }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              fullWidth
            />
            <Select
              name="role"
              value={newMember.role}
              onChange={(e) =>
                setNewMember((prev) => ({ ...prev, role: e.target.value }))
              }
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Chọn Vai Trò</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleName}>
                  {role.roleName.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddMemberDialogClose}>Hủy</Button>
          <Button onClick={handleAddMember} variant="contained" color="primary">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
