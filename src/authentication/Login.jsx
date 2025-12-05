import { Mail } from "lucide-react"
import GoogleIcon from "../assets/images/google-icon.svg"
import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { toast } from "react-toastify"
import Playstore from "../assets/images/playstore.png"
import Appstore from "../assets/images/apple.png"

export default function Login() {
  const [email, setEmail] = useState("")
  const location = useLocation()
  const { sendEmailLink, signInWithGoogle, loading, completeEmailLinkSignIn } = useAuth()
  const isSignup = location.pathname === "/signup"
  // const [deferredPrompt, setDeferredPrompt] = useState(null);

  // useEffect(() => {
  //   const handler = (e) => {
  //     e.preventDefault();
  //     setDeferredPrompt(e);
  //   };

  //   window.addEventListener('beforeinstallprompt', handler);

  //   return () => {
  //     window.removeEventListener('beforeinstallprompt', handler);
  //   };
  // }, []);

  // const handleInstallApp = async () => {
  //   if (!deferredPrompt) {
  //     alert('App already installed or install not available on this device');
  //     return;
  //   }

  //   deferredPrompt.prompt();

  //   const { outcome } = await deferredPrompt.userChoice;

  //   if (outcome === 'accepted') {
  //     console.log('User accepted the install');
  //   } else {
  //     console.log('User dismissed the install');
  //   }

  //   setDeferredPrompt(null);
  // };

  // Jab user email link se wapas aaye, to yahan se login complete hoga
  useEffect(() => {
    completeEmailLinkSignIn()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email) {
      toast.info("Please provide your email!")
      return
    }

    try {
      await sendEmailLink(email)
      setEmail("")
    } catch (error) {
      console.error("Email link error:", error)
      toast.error("Something went wrong, please try again.")
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Google sign-in error:", error)
      toast.error("Failed to sign in with Google. Please try again.")
    }
  }

  return (
    <div style={{ backgroundImage: `url(https://assets.nflxext.com/ffe/siteui/vlv3/4ffe3d37-1fc1-4d93-b61a-1fa58c11ccff/web/IN-en-20251124-TRIFECTA-perspective_9f00d07d-f08e-494f-8907-92371138c534_small.jpg)` }} className="min-h-screen py-20 flex items-center justify-center bg-cover bg-center login_bg flex-col relative">
      {/* <h1 className="text-4xl 3xl:text-5xl font-semibold text-center mb-7 relative z-10">UniFlix</h1> */}
      <form onSubmit={handleSubmit} className="max-w-[490px] w-full relative z-10 flex flex-col gap-4 sm:border-2 sm:border-red-700 sm:rounded-lg p-3 py-10 sm:px-5 sm:backdrop-blur-sm">
        <div>
          <label htmlFor="email" className=" text-center text-3xl font-medium pb-4 block">{isSignup ? "Create account" : "Log in"}</label>
          <div className="flex items-center gap-3 rounded-md px-3 bg-zinc-700 text-sm sm:text-base 3xl:text-lg">
            <Mail />
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 outline-none bg-transparent"
              type="email"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 disabled:bg-red-800/60 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md text-base xs:text-md 3xl:text-xl font-medium mt-5 cursor-pointer hover:bg-red-700 transition-all duration-300"
        >
          {loading ? "Please wait..." : isSignup ? "Send signup link" : "Send login link"}
        </button>
        <button
          onClick={handleGoogleSignIn}
          type="button"
          disabled={loading}
          className="bg-gray-200 text-black px-4 py-3 rounded-md text-base xs:text-md 3xl:text-xl font-medium mt-0 cursor-pointer hover:bg-gray-300 transition-all duration-300 flex items-center gap-2 justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5" /> Continue with Google
        </button>
        <div className="text-center max-xs:text-sm">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link className="text-red-600 underline" to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Login" : "Sign up"}
            </Link>
          </p>
        </div>
      </form>
      {/* <div className="flex relative z-10 items-center gap-10 sm:mt-5">
        <button onClick={handleInstallApp} type="button" className="cursor-pointer">
          <img className="w-30 sm:w-40 [box-shadow:0px_0px_22px_1px_#ffffff73] rounded-lg" src={Playstore} alt="playstore-btn" />
        </button>
        <button onClick={handleInstallApp} type="button" className="cursor-pointer">
          <img className="w-30 sm:w-40 [box-shadow:0px_0px_22px_1px_#ffffff73] rounded-lg" src={Appstore} alt="Appstore-btn" />
        </button>
      </div> */}
    </div>
  )
}
