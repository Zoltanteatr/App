import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../userSlice";

export const useUser = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  return {
    ...user,
    setUser: (user) => dispatch(updateUserData(user)),
  };
};
