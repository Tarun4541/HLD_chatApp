"use client"
import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './zustand/useAuthStore';

const Auth = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {authName, updateAuthName} = useAuthStore();

    const signUpFunc = async (event) => {
        event.preventDefault();

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BE_HOST}:8080/auth/signup`, {
                username: username,
                password: password
            },
                {
                    withCredentials: true
                })
            if (res.data.message === "Username already exists") {
                alert('Username already exists');
            } else {
                updateAuthName(username);
                router.replace('/chat');
            }
        } catch (error) {
            console.log("Error in signup function : ", error.message);
        }
    }


    const loginFunc = async (event) => {
        event.preventDefault();

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BE_HOST}:8080/auth/login`, {
                username: username,
                password: password
            },
                {
                    withCredentials: true
                })
            updateAuthName(username);
            router.replace('/chat');
        } catch (error) {
            console.log("Error in login function : ", error.message);
        }
    }


    return (
        <div>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" >
                        <div>
                            <label className="block text-sm font-medium leading-6 text-blue-400">Username</label>
                            <div className="mt-2">
                                <input id="username"
                                    name="username"
                                    type="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium leading-6 text-blue-400">Password</label>
                            </div>
                            <div className="mt-2">
                                <input id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>


                        <div className="flex">
                            <button type="submit" onClick={signUpFunc} className="flex m-2 w-1/2 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign Up</button>
                            <button type="submit" onClick={loginFunc} className="flex m-2 w-1/2 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Auth