import clsx from "clsx";
import styles from "./message.module.scss";

const Message = ({ message, isUserMessage, images }) => {
  return (
    <div className={clsx(styles.root, isUserMessage ? styles.user : "")}>
      <div className={clsx(styles.message, isUserMessage ? styles.user : "")}>
        <p className={styles.message__content}>{message}</p>

        {images && images.length > 0 && (
          <div className={styles.message__images}>
            {images.map((img, index) =>
              img?.url ? (
                <img
                  key={index}
                  src={img.url}
                  alt={`image-${index}`}
                  className={styles.message_image}
                />
              ) : (
                <span key={index} className={styles.image_error}>
                  Ошибка изображения
                </span>
              )
            )}
          </div>
        )}
      </div>

      <div className={clsx(styles.hook, isUserMessage ? styles.user : "")} />
    </div>
  );
};

export default Message;
