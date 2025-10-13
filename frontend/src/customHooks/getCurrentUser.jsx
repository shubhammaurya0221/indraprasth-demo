import { useEffect } from "react"
import { serverUrl } from "../App"
import axios from "axios"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

const useGetCurrentUser = ()=>{
    let dispatch = useDispatch()
   
    useEffect(()=>{
        const fetchUser = async () => {
            try {
                let result = await axios.get(serverUrl + "/api/user/currentuser" , {withCredentials:true})
                dispatch(setUserData(result.data))
            } catch (error) {
                console.log(error)
                dispatch(setUserData(null))
            }
        }
        fetchUser()
    },[dispatch, serverUrl]) // Add dependencies to prevent infinite loops
}

export default useGetCurrentUser