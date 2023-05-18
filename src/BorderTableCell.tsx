import { styled, tableCellClasses } from "@mui/material";
import { TableCell } from "@mui/material";

export const BorderTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    border: "1px solid #252525",
    fontSize: 15,
    backgroundColor: theme.palette.grey[200],
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    whiteSpace: "nowrap",
    textSizeAdjust: "auto",
    overflow: "hidden",
    fontFamily: "Arial",
    width: "12vw",
    fontSize: "6em",
    fontWeight: "bold",
    border: "1px solid #f0f0f0",
    textAlign: "center",
    backgroundColor: theme.palette.common.black,
    padding: 0,
  },
}));
