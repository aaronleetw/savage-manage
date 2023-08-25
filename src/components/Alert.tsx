import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Text } from "@chakra-ui/react";
import { useRef } from "react";

export default function Alert({ isOpen, onClose, executeAction, title, children }: { isOpen: boolean, onClose: () => void, executeAction: () => void, title:string, children: JSX.Element }) {
    const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>;

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete {title}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <Text mb="2">
                            Are you sure? You can&apos;t undo this action afterwards.
                        </Text>
                        <Text>
                            {children}
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button onClick={onClose} ref={cancelRef as React.LegacyRef<HTMLButtonElement>}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={executeAction} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}