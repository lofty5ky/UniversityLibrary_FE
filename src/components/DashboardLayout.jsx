import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Toolbar,
  Box,
} from "@mui/material";
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Feedback as FeedbackIcon,
  Report as ReportIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  ReceiptLong as ReceiptLongIcon,
  CardMembership as CardMembershipIcon,
  Gavel as GavelIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  PendingActions as PendingActionsIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { CircleNotifications } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import Header from "./Header";
import LogoutItem from "./LogoutItem";

const drawerWidth = 280;

const DashboardLayout = ({ children, userType = "client" }) => {
  const location = useLocation();

  // Menu items cho client
  const clientMenuItems = [
    { text: "Trang chủ", icon: <HomeIcon />, to: "/client/home" },
    {
      text: "Yêu cầu mượn sách",
      icon: <ReceiptLongIcon />,
      to: "/client/reservation",
    },
    {
      text: "Sách đã mượn",
      icon: <HistoryIcon />,
      to: "/client/borrow",
    },
    {
      text: "Góp ý & phản hồi",
      icon: <FeedbackIcon />,
      to: "/client/feedback",
    },
    {
      text: "Lịch sử vi phạm",
      icon: <ReportIcon />,
      to: "/client/violation-history",
    },
  ];

  // Menu items cho admin
  const adminMenuItems = [
    {
      text: "Quản lý sách thư viện",
      icon: <MenuBookIcon />,
      to: "/admin/book-management",
    },
    {
      text: "Yêu cầu đặt mượn",
      icon: <PendingActionsIcon />,
      to: "/admin/reservations",
    },
    {
      text: "Quản lý mượn sách",
      icon: <ReceiptLongIcon />,
      to: "/admin/borrow-management",
    },
    { text: "Thống kê", icon: <BarChartIcon />, to: "/admin/statistics" },
    {
      text: "Quản lý thể loại",
      icon: <CategoryIcon />,
      to: "/admin/category-list",
    },
    {
      text: "Quản lý tác giả",
      icon: <PersonIcon />,
      to: "/admin/author-list",
    },
    {
      text: "Quản lý nhà xuất bản",
      icon: <BusinessIcon />,
      to: "/admin/publisher-list",
    },
    {
      text: "Quản lý thành viên",
      icon: <GroupIcon />,
      to: "/admin/member-list",
    },
    {
      text: "Quản lý thẻ sách",
      icon: <CardMembershipIcon />,
      to: "/admin/card-management",
    },
    {
      text: "Quản lý vi phạm",
      icon: <GavelIcon />,
      to: "/admin/violation-management",
    },
    {
      text: "Phản hồi góp ý",
      icon: <FeedbackIcon />,
      to: "/admin/user-feedback",
    },
    {
      text: "Quản lý thông báo",
      icon: <CircleNotifications />,
      to: "/admin/notifications",
    },
  ];

  // Chọn menu items dựa trên userType
  const menuItems = userType === "admin" ? adminMenuItems : clientMenuItems;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Header */}
      <Header />

      {/* Left Side Menu */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5dc",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                component={Link}
                to={item.to}
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    location.pathname === item.to ? "#e5e5c9" : "inherit",
                  borderRadius: location.pathname === item.to ? "8px" : "0px",
                  "&:hover": {
                    backgroundColor: "#e5e5c9",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.to ? "#000000" : "#4b4b4b",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color:
                      location.pathname === item.to ? "#000000" : "#4b4b4b",
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <LogoutItem />
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
