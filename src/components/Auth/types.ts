type MessageType = {
    status: "info" | "warning" | "success" | "error" | "loading" | undefined,
    msg: string
}

export type { MessageType };