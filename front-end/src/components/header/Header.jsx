import { useUser } from "../../store/slices/hooks/useUser";
import { Link } from "react-router";
import clsx from "clsx";
import userDefault from "../../img/userdef.svg";

import styles from "./header.module.scss";

const Header = () => {
  const { userName, userAvatar, userPts } = useUser();
  return (
    <header>
      <div className={styles.user__info}>
        <div className={styles.user__text}>
          <p className={styles.user__name}>{userName}</p>
          <p className={styles.user__pts}>{userPts} очков</p>
        </div>
        <Link
          to="/profile"
          className={clsx(
            styles.link__profile,
            userAvatar === "" ? styles.user__def : ""
          )}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="User avatar"
              className={styles.user__img}
            />
          ) : (
            <img
              src={userDefault}
              alt="Default avatar"
              className={styles.user__img}
            />
          )}
        </Link>
      </div>
    </header>
  );
};
export default Header;
