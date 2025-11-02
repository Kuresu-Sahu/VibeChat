import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import assets from '../assets/assets'

/**
 * VerifyOtpPage allows a user to enter the one-time code sent to their email
 * during signup. It supports resending the code and redirects to login on success.
 */
export default function VerifyOtpPage() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email || ''

    const verify = async () => {
        if (!email) {
            setMsg('Missing email. Go back to signup.')
            return
        }
        setLoading(true)
        try {
            const res = await axios.post('/api/auth/verify-otp', { email, otp })
            if (res.data.success) {
                setMsg('Verified! You can now log in.')
                setTimeout(() => navigate('/login'), 1200)
            } else {
                setMsg(res.data.message || 'Verification failed')
            }
        } catch (err) {
            setMsg(err?.response?.data?.message || 'Server error')
        } finally {
            setLoading(false)
        }
    }

    const resend = async () => {
        setLoading(true)
        try {
            await axios.post('/api/auth/request-otp', { email })
            setMsg('OTP resent to your email')
        } catch (err) {
            setMsg(err?.response?.data?.message || 'Error resending OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            <img src={assets.logo_big} alt="logo" className='w-[min(30vw,250px)]' />
            <form className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg w-[min(420px,90%)] backdrop-blur-2xl' onSubmit={(e) => { e.preventDefault(); verify(); }}>
                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    Verify Email
                </h2>

                <p className='text-sm text-gray-200'>We sent a code to: <strong className='text-white'>{email}</strong></p>

                <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter OTP' className='border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white' />

                <div className='flex gap-2'>
                    <button type='submit' disabled={loading} className='bg-linear-to-r from-purple-400 to-violet-600 text-white py-3 rounded-md w-1/2'>
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                    <button type='button' onClick={resend} disabled={loading} className='bg-gray-200 text-gray-900 py-3 rounded-md w-1/2'>
                        Resend
                    </button>
                </div>

                {msg && <p className='mt-3 text-sm text-white'>{msg}</p>}
            </form>
        </div>
    )
}
