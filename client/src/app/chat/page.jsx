'use client'
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../zustand/useAuthStore';
import { useUsersStore } from '../zustand/useUsersStore';
import { useChatReceiverStore } from '../zustand/useChatReceiverStore';
import { useChatMsgsStore } from '../zustand/useChatMsgsStore';
import axios from "axios";
import ChatUsers from '../_components/chatUsers';

const chat = () => {

    
    const [msg, setMsg] = useState(''); //usestate return array of 2 values
    const [socket, setSocket] = useState(null);
    const { authName } = useAuthStore();
    const { updateUsers } = useUsersStore();
    const { chatReceiver } = useChatReceiverStore();
    const { chatMsgs, updateChatMsgs} = useChatMsgsStore();


    //get Users from BE to FE
    const getUserData = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BE_HOST}:8080/users`,
            {
                withCredentials: true
            })
        updateUsers(res.data);
        console.log(res.data);
    }


    useEffect(() => {
        // Establish WebSocket connection
        const newSocket = io(`${process.env.NEXT_PUBLIC_BE_HOST}:8081`, {
            query: {
                username: authName
            }
        });
        setSocket(newSocket);


        // Listen for incoming msgs
        newSocket.on('chat msg', msg => {
            console.log('received msg on client ' + msg.text);
            updateChatMsgs([...chatMsgs, msg]);
        });

        getUserData();

        // Clean up function
        return () => newSocket.close();
    }, []);



    const sendMsg = (e) => {
        e.preventDefault();
        const msgToBeSent = {
            text: msg,
            sender: authName,
            receiver: chatReceiver
        };
        if (socket) {
            socket.emit('chat msg', msgToBeSent);
            updateChatMsgs([...chatMsgs, msgToBeSent]);
            setMsg('');
        }
    }

    return (
        <div className='h-screen flex divide-x-4'>
            <div className='w-1/5'>
                <ChatUsers />
            </div >
            <div className='w-4/5 flex flex-col'>
                <div >
                    <h1 className="text-sm font-medium text-neutral-200">
                        {authName} is chatting with {chatReceiver}
                    </h1>
                </div>

                {/* RIGHT PANE */}
                <div className="relative flex-1">

                    {/* messages list (space added for the centered bar) */}
                    <div className='msgs-container h-full overflow-y-auto px-4 py-4 space-y-2 pt-24'>
                        {chatMsgs?.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === authName ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow
            ${msg.sender
=== authName                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                            : 'bg-neutral-800 text-neutral-100'}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* centered composer */}
                    <div className='absolute left-1/2 -translate-x-1/2 top-6 z-10 w-full max-w-2xl'>
                        <form onSubmit={sendMsg} className="w-full">
                            <div className="relative flex items-center gap-2 bg-neutral-900/70 backdrop-blur rounded-2xl p-2 shadow">
                                <input
                                    type="text"
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    placeholder="Type your text here"
                                    required
                                    className="flex-1 rounded-xl border border-white/10 bg-neutral-800/80 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    )
}

export default chat