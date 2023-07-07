import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { ICellEditorParams } from "ag-grid-community";
import { forwardRef, memo, useEffect, useImperativeHandle, useState, useMemo } from "react";
import { FiCheckCircle, FiHelpCircle, FiSlash, FiTrash, FiXCircle } from "react-icons/fi";

const StatusRenderer = memo((props: ICellEditorParams) => {
    const imageForMood = (mood: any) =>
      'https://www.ag-grid.com/example-assets/smileys/' +
      (mood === 'Happy' ? 'happy.png' : 'sad.png');
  
    const mood = useMemo(() => imageForMood(props.value), [props.value]);
  
    return <img width="20px" src={mood} />;
  });
  
const StatusEditor = memo(
    forwardRef((props: ICellEditorParams, ref) => {
    //   const isHappy = (value: string) => value === 'Happy';
  
    //   const [happy, setHappy] = useState(isHappy(props.value));
    const [done, setDone] = useState(false);
  
    useEffect(() => {
        if (done) props.stopEditing();
    }, [done]);
    const [status, setStatus] = useState(props.value);
    const happy = true;
  
      useImperativeHandle(ref, () => {
        return {
          getValue() {
            return status;
          },
        };
      });
  
      return (
        <VStack padding="2" align="stretch">
            <HStack borderRadius="md" border="2px" borderColor={status === 2 ? "blue.300" : "gray.400"} padding="2" cursor="pointer" onClick={() => {
                setStatus(2);
                setDone(true);
            }}>
                <Icon
                    as={FiCheckCircle}
                    color={"green.500"}
                    fontSize="2xl"
                    mr="1"
                />
                <Text>Will Attend</Text>
            </HStack>
            <HStack borderRadius="md" border="2px" borderColor={status === 1 ? "blue.300" : "gray.400"} padding="2" cursor="pointer" onClick={() => {
                setStatus(1);
                setDone(true);
            }}>
                <Icon
                    as={FiXCircle}
                    color={"red.500"}
                    fontSize="2xl"
                    mr="1"
                />
                <Text>Will Not Attend</Text>
            </HStack>
            <HStack borderRadius="md" border="2px" borderColor={status === 0 ? "blue.300" : "gray.400"} padding="2" cursor="pointer" onClick={() => {
                setStatus(0);
                setDone(true);
            }}>
                <Icon
                    as={FiHelpCircle}
                    color={"yellow.500"}
                    fontSize="2xl"
                    mr="1"
                />
                <Text>Not Responded Yet</Text>
            </HStack>
            <HStack borderRadius="md" border="2px" borderColor={status === -1 ? "blue.300" : "gray.400"} padding="2" cursor="pointer" onClick={() => {
                setStatus(-1);
                setDone(true);
            }}>
                <Icon
                    as={FiSlash}
                    color={"red.500"}
                    fontSize="2xl"
                    mr="1"
                />
                <Text>Not allowed</Text>
            </HStack>
        </VStack>
      );
    })
  );
  
export default StatusEditor;