import axios from "axios";

const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': '69420'
  }
});

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
