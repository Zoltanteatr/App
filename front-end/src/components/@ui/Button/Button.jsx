import clsx from "clsx";
import { Link } from "react-router-dom";
import styles from "./button.module.scss";
const Button = ({
  buttonContent,
  buttonClass,
  secondClass,
  onClick,
  to,
  isHtml = false,
}) => {
  const classNames = clsx(
    styles.button,
    styles[buttonClass],
    styles[secondClass]
  );

  const content = isHtml ? (
    <p dangerouslySetInnerHTML={{ __html: buttonContent }} />
  ) : (
    buttonContent
  );

  if (to) {
    return (
      <Link to={to} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classNames} onClick={onClick}>
      {content}
    </button>
  );
};

export default Button;
