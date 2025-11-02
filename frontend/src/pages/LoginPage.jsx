import React, { useContext } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext.jsx';

/**
 * LoginPage component handles both login and signup flows.
 * - On signup it collects user details and triggers server-side OTP sending,
 *   then navigates the user to `/verify` to validate their email.
 * - On login it authenticates and stores the JWT on success.
 */
const LoginPage = () => {

    const [currState, setCurrState] = useState("Sign Up")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [bio, setBio] = useState("")
    const [isDataSubmitted, setIsDataSubmitted] = useState(false)

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (currState === "Sign Up" && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }
        const doLogin = async () => {
            const res = await login(currState === "Sign Up" ? "signup" : "login", { fullName, email, password, bio });
            if (currState === "Sign Up") {
                if (res?.success) {
                    // navigate to verify page with email
                    navigate('/verify', { state: { email } });
                }
            }
        }
        doLogin();
    }

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            {/* left side */}
            <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />
            {/* right */}
            <form onSubmit={onSubmitHandler} action="" className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    {currState}
                    {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}

                </h2>

                {currState === "Sign Up" && !isDataSubmitted && (
                    <input onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" placeholder='Full Name' className='border border-gray-500 rounded-md p-2 focus:outline-none' required />
                )}
                {!isDataSubmitted && (
                    <>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='Email' className='border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500' required />
                        <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='Password' className='border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500' required />
                    </>
                )
                }
                {currState === "Sign Up" && isDataSubmitted && (
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} placeholder='Provide a short bio...' className='border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500' required></textarea>
                )}
                <button type='submit' className='bg-linear-to-r from-purple-400 to-violet-600 text-white py-3 rounded-md cursor-pointer'>
                    {currState === "Sign Up" ? "Create Account" : "Login Now"}
                </button>

                {/* <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <input type="checkbox" />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div> */}

                <div className='flex flex-col gap-2'>
                    {currState === "Sign Up" ? (
                        <p className='text-sm text-gray-600 text-center mx-auto'>Already have an account? <span onClick={() => { setCurrState("Login"); setIsDataSubmitted(false) }} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
                    ) : (
                        <p className='text-sm text-gray-600 text-center mx-auto'>Create an account <span onClick={() => setCurrState("Sign Up")} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
                    )}
                </div>

            </form>

        </div>
    )
}

export default LoginPage
