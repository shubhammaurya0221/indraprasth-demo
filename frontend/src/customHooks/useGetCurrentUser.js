import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUserData, setLoading } from "../redux/userSlice"; // adjust path if needed

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

/**
 * Custom hook to rehydrate user session from backend
 * - Checks for valid cookie
 * - Updates Redux with user data
 * - Controls loading flag for route protection
 */
const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    axios.get(`${serverUrl}/api/user/currentuser`, {
      withCredentials: true
    })
    .then(res => {
      dispatch(setUserData(res.data.user));
    })
    .catch(() => {
      dispatch(setUserData(null));
    })
    .finally(() => {
      dispatch(setLoading(false));
    });
  }, []);
};

export default useGetCurrentUser;
