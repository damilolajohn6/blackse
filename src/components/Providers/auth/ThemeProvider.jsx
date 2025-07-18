import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { useMemo } from "react";

const cache = createCache({ key: "css", prepend: true });

export default function ThemeProvider({ children }) {
  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </CacheProvider>
  );
}
