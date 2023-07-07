import { extendTheme } from "@chakra-ui/react"

const chakraTheme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "#f7f7f7",
      }
    })
  },
});

export { chakraTheme };