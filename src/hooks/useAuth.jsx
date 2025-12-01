import { createContext, useContext, useState } from "react";
import Cookies from 'js-cookie';
import {
    GoogleAuthProvider,
    signInWithPopup,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut as firebaseSignOut
} from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../firebaseConfig";

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const provider = new GoogleAuthProvider();
    const { pathname } = useLocation()
    // Google Sign In
    async function signInWithGoogle() {
        setLoading(true)
        try {
            const result = await signInWithPopup(auth, provider)
            Cookies.set('vk', 'true', { expires: 30 });
            Cookies.set('email', result.user.email, { expires: 365 });
            Cookies.set('displayName', result.user.displayName, { expires: 365 });
            toast.success("Signed in with Google!")
            navigate("/home")
        } catch (error) {
            toast.error(error.code)
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Send Email Link for Sign In
    async function sendEmailLink(email) {
        setLoading(true)
        try {
            const actionCodeSettings = {
                url: window.location.origin + pathname,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings)
            // Save email locally for completing sign-in
            window.localStorage.setItem('emailForSignIn', email);
            toast.success("Sign-in link sent to your email please check your email inbox/span!")
        } catch (error) {
            toast.error(error.code)
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Complete Email Link Sign In
    async function completeEmailLinkSignIn(emailFromUrl = null) {
        setLoading(true)
        try {
            // Check if the current URL is a sign-in link
            if (isSignInWithEmailLink(auth, window.location.href)) {
                // Get email from localStorage or parameter
                let email = emailFromUrl || window.localStorage.getItem('emailForSignIn');

                if (!email) {
                    // If email is not available, prompt user to enter it
                    email = window.prompt('Please provide your email for confirmation');
                }

                const result = await signInWithEmailLink(auth, email, window.location.href)

                // Clear email from storage
                window.localStorage.removeItem('emailForSignIn');
                Cookies.set('vk', 'true', { expires: 30 });
                Cookies.set('email', result.user.email, { expires: 365 });
                Cookies.set('displayName', result.user.displayName, { expires: 365 });
                console.log("first", result)
                toast.success("Signed in successfully!")
                navigate("/home")
                return true
            }
            return false
        } catch (error) {
            toast.error(error.code)
            console.log(error)
            return false
        } finally {
            setLoading(false)
        }
    }

    // Sign Out
    async function signOut() {
        try {
            await firebaseSignOut(auth)
            Cookies.remove('vk');
            Cookies.remove('email');
            Cookies.remove('displayName');
            toast.success("Signed out successfully!")
            navigate("/login")
        } catch (error) {
            toast.error(error.code)
            console.log(error)
        }
    }

    return (
        <AuthContext.Provider value={{
            loading,
            signInWithGoogle,
            sendEmailLink,
            completeEmailLinkSignIn,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}