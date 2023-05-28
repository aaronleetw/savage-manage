import { extendTheme } from "@chakra-ui/react"
import { createTheme } from "@mui/material";
import type {} from '@mui/x-data-grid/themeAugmentation';

const chakraTheme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "#f7f7f7",
      }
    })
  },
});

const muiTheme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
      },
    },
  },
})

export { chakraTheme, muiTheme };