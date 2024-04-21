import { DifyClient } from "dify-client";
import { unicodeToChar } from "@/util";

class ChatClient {
  private static instance: ChatClient;

  private difyClient: DifyClient;

  constructor() {
    this.difyClient = new DifyClient(
      process.env.NEXT_PUBLIC_DIFY_API_KEY || "",
      process.env.NEXT_PUBLIC_DIFY_API_BASE_URL
    );
  }

  public static getInstance(): ChatClient {
    if (!ChatClient.instance) {
      ChatClient.instance = new ChatClient();
    }
    return ChatClient.instance;
  }

  public async createChatMessage(
    query: string,
    userId: string,
    onData: Function,
    onComplete?: Function
  ) {
    const requestData = {
      inputs: {},
      query,
      user: userId,
      response_mode: "streaming",
    };
    const { data } = await this.difyClient.sendRequest(
      "POST",
      "/chat-messages",
      requestData,
      undefined,
      true
    );
    let buffer = "";
    let bufferObj: Record<string, any>;
    const response = new Response(data);
    const decoder = new TextDecoder("utf-8");
    const reader = response.body?.getReader();
    let isFirstMessage = true;

    const processChunk = ({
      value,
      done,
    }: {
      value: Uint8Array | undefined;
      done: boolean;
    }): any => {
      if (done) {
        onComplete && onComplete();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      try {
        lines.forEach((message) => {
          if (message.startsWith("data: ")) {
            bufferObj = JSON.parse(message.substring(6)) as Record<string, any>;

            if (
              bufferObj.event === "message" ||
              bufferObj.event === "agent_message"
            ) {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id,
              });
              isFirstMessage = false;
            }
          }
        });
      } catch (error) {
        console.log(error);
      }

      return reader
        ?.read()
        .then(({ value, done }) => processChunk({ value, done }));
    };

    reader?.read().then(({ value, done }) => processChunk({ value, done }));
  }
}

export default ChatClient;
