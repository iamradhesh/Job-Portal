"use client"
import { Card } from '@/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAppData } from '@/context/AppContext';

const PaymentVerification = () => {
    const { id } = useParams();
    const router = useRouter();
    const { fetchUser } = useAppData();

    // Refresh user data when component mounts
    useEffect(() => {
        fetchUser();
    }, []);

    const handleGoToAccount = async () => {
        // Refresh user data before navigation
        await fetchUser();
        router.push('/account');
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950'>
            <Card className='max-w-md w-full p-8 text-center shadow-2xl border-2'>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6 animate-pulse">
                    <CheckCircle size={40} className='text-green-600' />
                </div>
                
                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Payment Successful!
                </h1>
                
                <p className="text-base opacity-70 mb-2">
                    Your subscription is now active
                </p>
                
                <p className="text-sm opacity-60 mb-8">
                    Transaction ID: <span className="font-mono">{id}</span>
                </p>

                <div className="space-y-3">
                    <Button 
                        onClick={handleGoToAccount}
                        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                    >
                        Go to Account Page
                    </Button>
                    
                    <Link href="/" className="block">
                        <Button variant="outline" className="w-full">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default PaymentVerification;