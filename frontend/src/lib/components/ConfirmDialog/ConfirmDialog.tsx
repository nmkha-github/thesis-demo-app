import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { ReactNode, useState } from "react";
import LoadingButton from "../LoadingButton/LoadingButton";

interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void>;
  onClose?: () => void;
  style?: React.CSSProperties;
}

const ConfirmDialog = ({
  title,
  content,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
  open,
  style,
}: ConfirmDialogProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} style={style} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Box style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <Button
            variant="contained"
            style={{
              padding: "8px 16px",
              height: 40,
              textTransform: "none",
              backgroundColor: "whitesmoke",
              color: "black",
              marginRight: 8,
            }}
            onClick={() => onClose?.()}
          >
            <Typography style={{ fontWeight: 600 }}>
              {cancelText || "Hủy"}
            </Typography>
          </Button>

          <LoadingButton
            loading={loading}
            variant="contained"
            color="primary"
            style={{ padding: "8px 16px", height: 40 }}
            onClick={async () => {
              setLoading(true);
              await onConfirm?.();
              setLoading(false);
              onClose?.();
            }}
          >
            <Typography style={{ fontWeight: 600 }}>
              {confirmText || "Đồng ý"}
            </Typography>
          </LoadingButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
