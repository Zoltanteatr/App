import { useState, useEffect, useRef } from "react";
import Message from "./message/Message";
import Input from "../@ui/Input/Input";
import sendImage from "../../img/send.svg";
import clipImage from "../../img/clip.svg";
import supportAvatar from "../../img/support.png";
import styles from "./support.module.scss";
import ImageUploader from "./image-uploader/Image-uploader";
import { chatApi, socket } from "../../api/api";
import { useUser } from "../../store/slices/hooks/useUser";

const Support = () => {
  const { userId } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [images, setImages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatConfirmed, setIsChatConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  const chatStateRef = useRef({
    isConnected: false,
    isChatConfirmed: false,
    messages: [],
  });

  useEffect(() => {
    if (!userId) return;

    const chatState = JSON.parse(localStorage.getItem("chat_state"));

    if (chatState?.isChatConfirmed) {
      setIsConnected(chatState.isConnected);
      setIsChatConfirmed(true);
      setMessages(chatState.messages || []);
      setIsLoading(false);
    } else {
      chatApi.connect(userId);
    }

    chatApi.onAuthSuccess(() => {
      setIsConnected(true);
      setIsLoading(false);
      saveChatState({ isConnected: true, isChatConfirmed, messages });
    });

    chatApi.onChatFound(() => {
      setIsChatConfirmed(true);
      setIsSearching(false);
      chatStateRef.current.isChatConfirmed = true;
      saveChatState({
        isConnected: true,
        isChatConfirmed: true,
        messages: chatStateRef.current.messages,
      });
    });

    chatApi.onNewMessage((data) => {
      if (data.text || data.photo) {
        setMessages((prev) => {
          const cleaned = prev.filter(
            (msg) => !msg.id?.toString().startsWith("temp")
          );
          const updated = [
            ...prev,
            {
              id: Date.now(),
              message: data.text || "",
              is_user_message: false,
              attachments: data.photo ? [{ url: data.photo }] : [],
            },
          ];

          saveChatState({
            isConnected: true,
            isChatConfirmed: true,
            messages: updated,
          });

          chatStateRef.current.messages = updated;
          return updated;
        });
      }
    });

    chatApi.onChatClosed(() => {
      setIsConnected(false);
      setIsChatConfirmed(false);
      setMessages([]);
      setImages([]);
      chatStateRef.current = {
        isConnected: false,
        isChatConfirmed: false,
        messages: [],
      };
      localStorage.removeItem("chat_state");
    });

    return () => {
      chatApi.offAll();
    };
  }, [userId]);

  const handleStartSearch = () => {
    chatApi.startSearch();
    setIsSearching(true);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.max(event.target.scrollHeight, 45)}px`;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !userId) return;

    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;

    const tempMessage = {
      id: tempId,
      message: "",
      is_user_message: true,
      attachments: [{ url: previewUrl }],
    };

    setMessages((prev) => {
      const updated = [...prev, tempMessage];
      saveChatState({ isConnected, isChatConfirmed, messages: updated });
      return updated;
    });

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await chatApi.uploadChatPhoto(formData, socket.id);
    } catch (err) {
      console.error("Ошибка при отправке изображения:", err);
      setError("Ошибка при отправке изображения");
    }

    event.target.value = null;
  };

  const handleDeleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canSendMessage =
    (!!inputValue.trim() || images.length > 0) &&
    isConnected &&
    isChatConfirmed;

  const sendMessage = () => {
    if (!canSendMessage) return;

    chatApi.sendMessage(inputValue);

    const newMsg = {
      id: Date.now(),
      message: inputValue,
      is_user_message: true,
      attachments: images.map((img) => ({ url: img.fileLink })),
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      saveChatState({ isConnected, isChatConfirmed, messages: updated });
      return updated;
    });

    setInputValue("");
    setImages([]);
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "45px";
  };

  const saveChatState = ({ isConnected, isChatConfirmed, messages }) => {
    const state = { isConnected, isChatConfirmed, messages };
    chatStateRef.current = state;
    localStorage.setItem("chat_state", JSON.stringify(state));
  };

  return (
    <div className={styles.support}>
      <div className={styles.support__body}>
        <div className={styles.support__header}>
          <img src={supportAvatar} alt="" className={styles.header__avatar} />
          <p className={styles.support__title}>
            {isLoading
              ? "Загрузка..."
              : !isConnected
              ? "Вы не подключены к чату"
              : !isChatConfirmed
              ? isSearching
                ? "Поиск администратора..."
                : "Ожидание начала поиска..."
              : "Агент поддержки"}
          </p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <section className={styles.body__messages}>
          {messages.map((item) => (
            <Message
              key={item.id}
              message={item.message}
              isUserMessage={item.is_user_message}
              images={item.attachments}
            />
          ))}
          <div ref={messagesEndRef} />
        </section>

        {isConnected && !isChatConfirmed && (
          <>
            {!isSearching && (
              <button
                onClick={handleStartSearch}
                className={styles.connectButton}
              >
                Начать чат с поддержкой
              </button>
            )}
          </>
        )}

        <div className={styles.image__wrap}>
          {images.map((item, index) => (
            <ImageUploader
              key={index}
              name={item.fileName}
              size={item.fileSize}
              preview={item.fileLink}
              onDelete={() => handleDeleteImage(index)}
            />
          ))}
        </div>
        <div className={styles.support__footer}>
          <Input
            ref={textareaRef}
            placeholder="Введите сообщение"
            secondClass="chat__input"
            isTextArea={true}
            value={inputValue}
            onChange={handleInputChange}
          />
          {canSendMessage && (
            <img
              src={sendImage}
              alt=""
              className={styles.send}
              onClick={sendMessage}
            />
          )}
          <Input
            type="file"
            secondClass="upload"
            accept="image/*"
            onChange={handleFileChange}
          />
          <img src={clipImage} alt="" className={styles.clip} />
        </div>
      </div>
    </div>
  );
};

export default Support;
