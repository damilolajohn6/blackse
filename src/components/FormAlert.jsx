import { Alert, AlertTitle } from "@mui/material";

const FormAlert = ({ type, message }) => {
  if (!message) return null;

  return (
    <Alert severity={type} sx={{ mb: 2 }}>
      <AlertTitle>{type === "error" ? "Error" : "Success"}</AlertTitle>
      {message}
    </Alert>
  );
};

export default FormAlert;
