import Cookies from "js-cookie"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
    const isUser = Cookies.get("vk")

    if (!isUser) {
        return <Navigate to="/login" replace />
    }
    return children
}
