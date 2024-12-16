import { Button } from "@mui/material";

const ActionButton = ({ action, card, handleAction }) => {
  const actionMapping = {
    approve: { label: "Phê duyệt", color: "success" },
    reject: { label: "Từ chối", color: "purple" },
    lock: {
      label: card.status === "BLOCKED" ? "Mở khóa" : "Khóa",
      color: "warning",
    },
    delete: { label: "Xóa", color: "error" },
  };

  const { label, color } = actionMapping[action];

  const isDisabled =
    (card.status === "ACTIVE" &&
      (action === "approve" || action === "reject")) ||
    (card.status === "REJECTED" &&
      (action === "approve" || action === "reject" || action === "lock")) ||
    (card.status === "BLOCKED" &&
      (action === "approve" || action === "reject"));

  const actualAction =
    card.status === "BLOCKED" && action === "lock" ? "unlock" : action;

  return (
    <Button
      variant="outlined"
      onClick={() => handleAction(card.card_id, actualAction)}
      disabled={isDisabled}
      color={color !== "purple" ? color : undefined}
      sx={{
        mr: 1,
        borderColor: color === "purple" ? "#6a0dad" : undefined,
        color: color === "purple" ? "#6a0dad" : undefined,
        "&:hover": {
          backgroundColor: color === "purple" ? "#f3e5f5" : undefined,
        },
      }}
    >
      {label}
    </Button>
  );
};

export default ActionButton;
