import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import Cookies from "js-cookie";


const AxiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://test13.fireai.agency/api'
})

const useAxiosSecure = () => {

    const navigate = useNavigate()
    const {logOutUser} = useAuth()

    AxiosSecure.interceptors.request.use(function (config) {
        const token = Cookies.get('Access-Token');
        const role = Cookies.get('role');
        config.headers.authorization = `Bearer ${token}`;
        config.headers['ngrok-skip-browser-warning'] = '69420';
        return config;

    }, function (error) {
        return Promise.reject(error)
    })

    AxiosSecure.interceptors.response.use(function (response) {
        return response;
    }, async function (error) {

        const status = error.response?.status;
        if(status === 401 || status === 403){
            await logOutUser();
            navigate('/auth/login')

        }
        
        
        return Promise.reject(error);
    });
    return AxiosSecure;
};

export default useAxiosSecure;