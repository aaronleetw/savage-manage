import { extendTheme } from "@chakra-ui/react"
import { MultiSelectTheme } from 'chakra-multiselect'

const chakraTheme = extendTheme({
  components: {
    MultiSelect: MultiSelectTheme
  },
  styles: {
    global: () => ({
      body: {
        bg: "#f7f7f7",
      }
    })
  },
});

export { chakraTheme };