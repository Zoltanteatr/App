import React from "react";
import clsx from "clsx";
import styles from "./input.module.scss";

const Input = React.forwardRef(
  (
    { type, onChange, secondClass, isTextArea, value, style, placeholder },
    ref,
    accept
  ) => {
    return (
      <>
        {isTextArea ? (
          <textarea
            ref={ref}
            className={clsx(styles.textarea, styles[secondClass])}
            value={value}
            style={style}
            onChange={onChange}
            placeholder={placeholder}
          ></textarea>
        ) : (
          <input
            type={type}
            ref={ref}
            accept={accept}
            placeholder={placeholder}
            onChange={onChange}
            className={clsx(styles.input, styles[secondClass])}
          />
        )}
      </>
    );
  }
);

export default Input;
