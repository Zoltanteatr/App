import { useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import LinkNav from "./link-nav/Link-nav";
import chat_img from "../../img/chat.svg";
import main_img from "../../img/main.svg";
import leaders_img from "../../img/leaders.svg";
import info_img from "../../img/info.svg";

import styles from "./navigation.module.scss";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');

  const handleLeadersClick = () => {
    if (gameId) {
      navigate(`/lead/${gameId}`);
    } else {
      navigate('/lead/1'); // или какое-то значение по умолчанию
    }
  };

  const routes = [
    {
      routeIco: chat_img,
      routeLink: "/support",
      isActive: location.pathname === "/support",
    },
    {
      routeIco: main_img,
      routeLink: "/main",
      isActive: location.pathname === "/main",
    },
    {
      routeIco: leaders_img,
      routeLink: gameId ? `/lead/${gameId}` : "/lead/1",
      isActive: location.pathname.startsWith("/lead"),
      onClick: handleLeadersClick
    },
    {
      routeIco: info_img,
      routeLink: "/info",
      isActive: location.pathname === "/info",
    },
  ];
  return (
    <nav className={styles.navigation}>
      {routes.map((item, index) => (
        <LinkNav key={index} {...item} />
      ))}
    </nav>
  );
};
export default Navigation;
