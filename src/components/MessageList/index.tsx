import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import io from "socket.io-client";
import { api } from "../../services/api";
import logo from "../../assets/logo.svg";

interface IMessage {
  id: string;
  text: string;
  user: {
    avatar_url: string;
    name: string;
  };
}

let messagesQueue: IMessage[] = [];

const socket = io("http://localhost:4000");

socket.on("new_message", (newMessage: IMessage) =>
  messagesQueue.push(newMessage)
);

export const MessageList = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((prevState) =>
          [messagesQueue[0], ...prevState].filter(Boolean)
        );

        messagesQueue.shift();
      }
    }, 3000);
  }, []);

  useEffect(() => {
    getMessages();
  }, []);

  const getMessages = async () => {
    try {
      const res = await api.get<IMessage[]>("/messages/last/3");
      setMessages(res.data);
    } catch (error) {
      console.log({ errorCode: error });
    }
  };

  return (
    <div className={styles.messageListWrapper}>
      <img src={logo} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map((message) => {
          return (
            <li key={message.id} className={styles.message}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
