// frontend/src/app/(auth)/reset/[token]/page.tsx
'use client'
import { auth_service, useAppData, user_service } from '@/context/AppContext';
import axios, { AxiosError } from 'axios';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ApiErrorResponse {
    message?: string;
}

const ResetPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    
    const { isAuth } = useAppData();
    const router = useRouter();
    const params = useParams(); 
    const token = params.token; // This gets the token from the URL slug

    useEffect(() => {
        if (isAuth) {
            router.push('/');
        }
    }, [isAuth, router]);

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic Validation
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${auth_service}/api/auth/reset/${token}`, { password });
            toast.success(data.message || "Password reset successful!");
            router.push('/login');
        } catch (err: unknown) {
            let errorMessage = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<ApiErrorResponse>;
                errorMessage = serverError.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setBtnLoading(false);
        }
    }

    if (isAuth) return null;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={submitHandler}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={btnLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all mt-6"
                    >
                        {btnLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPage;