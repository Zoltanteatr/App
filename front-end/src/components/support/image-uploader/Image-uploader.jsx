import styles from "./image-uploader.module.scss";
import crossImage from "../../../img/cross.svg";

const ImageUploader = ({ name, size, preview, onDelete }) => {
  return (
    <div className={styles.image__uploader}>
      <img src={preview} alt="" className={styles.image__preview} />
      <div className={styles.image__info}>
        <p className={styles.image__name}>{name}</p>
        <p className={styles.image__size}>{size} KB</p>
      </div>
      <button className={styles.delete__button} onClick={onDelete}>
        <img src={crossImage} alt="Удалить" className={styles.delete__icon} />
      </button>
    </div>
  );
};

export default ImageUploader;
