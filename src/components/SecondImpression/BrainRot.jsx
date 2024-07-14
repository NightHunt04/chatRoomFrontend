import { useEffect, useMemo, useState } from "react"
import { useSocket } from '../../utils/socketIntegration'
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from "react-router-dom";
import { createRef } from "react";
import './style.css'

function BrainRot() {
    const [onlineCount, setOnlineCount] = useState(0)
    const location = useLocation()
    const { username, roomId, joined } = location.state || {}
    const socket = useSocket()
    const [userMessage, setUserMessage] = useState('')
    const messagesEndRef = createRef()
    const [userTyping, setUserTyping] = useState('')

    function getTime() {
        const now = new Date()
        let hours = now.getHours()
        const minutes = now.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'PM' : 'AM'
      
        hours = hours % 12 || 12
      
        return `${hours}:${minutes} ${ampm}`
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }

    const handleSendMessage = () => {
        const userMsg = {
            'role': 'user',
            'username': username,
            'text': userMessage,
            'time': getTime()
        }
        setUserMessage('')
        setMessages(messages => [...messages, userMsg])
        scrollToBottom()

        socket.emit('message', {
            username: username,
            text: userMsg.text,
            roomId
        })
    }

    useMemo(() => {
        socket.on('recieve-message', ({ username, text, time }) => {
            const otherMsg = {
                'role': 'other',
                'username': username,
                'text': text,
                time
            }
            setMessages(messages => [...messages, otherMsg])
            scrollToBottom()
        })
    }, [])

    useMemo(() => {
        socket.on('online-stats-response', (count) => {
            setOnlineCount(count)
        })

        socket.on('new-joined', ({ username, time }) => {
            const joinedMsg = {
                'role': 'new',
                username,
                time
            }
            setMessages(messages => [...messages, joinedMsg])
            scrollToBottom()
        })

        socket.on('user-left', ({ username, time }) => {
            const leftMsg = {
                'role': 'left',
                username,
                time
            }
            setMessages(messages => [...messages, leftMsg])
            scrollToBottom()
            console.log('user left')
        })

        socket.on('typing-user', (username) => {
            setUserTyping(username)
        })

        setInterval(() => {
            if(username)
                setUserTyping('')
        }, 1500)
    }, [])
    

    setInterval(() => {
        socket.emit('online-stats', roomId)
    }, 7000)

    

    const [messages, setMessages] = useState([])

    return (
        <div className="relative flex flex-col items-center h-screen justify-start w-full 2xl:w-[60%] overflow-hidden">
            <p className="mt-2 text-[16px] 2xl:text-[19px] flex items-center justify-center">Room ID :&nbsp;<span className="px-2 py-1 bg-[#e1e1e1] rounded-lg text-[13px] 2xl:text-[15px]">{roomId}</span><span className="ml-8 text-[15px]"><i className="fa-solid fa-globe text-green-600"></i> {onlineCount}</span></p>
            { joined && <p className="text-center text-[12px] 2xl:text-[14px] text-green-500 px-3 pt-9 flex items-center justify-center  w-[98%] 2xl:w-[90%] 3xl:w-[60%] 2xl:pr-20 pr-6">You joined the room at {getTime()}</p>}

            <div className="my-2 flex flex-col items-center justify-start px-4 h-[86%] overflow-y-auto w-[98%] 2xl:w-[90%] 3xl:w-[60%] 2xl:pr-20 pr-6">
                {
                    messages.map(message => {
                           return(
                                message.role === 'new' || message.role === 'left' ?
                                <div key={uuidv4()} className="my-2 flex flex-col items-start relative w-full">
                                    {
                                       message.role === 'new' ?
                                        <p className="text-[12px] 2xl:text-[14px] text-green-500 text-center w-full bg-white px-3">{message.username} joined the chat at {message.time}</p>
                                        :
                                        <p className={`${message.role === 'left' ? 'flex items-center justify-center' : 'hidden'} text-[12px] 2xl:text-[14px] text-red-500 text-center w-full bg-white px-3`}>{message.username} left the chat at {message.time}</p>
                                    }
                                </div>
                                :
                                <div  key={uuidv4()} className={`my-2 flex flex-col items-start relative ${message.role === 'other' ? 'self-start' : 'self-end'}`}>
                                    {message.role === 'other' && <p className="px-2 text-[11px] 2xl:text-[13px]">{message.username}</p>}
                                    <p className={`${message.role !== 'other' ? 'bg-[#2337c6] text-white rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl' : 'bg-[#ebebeb] rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'} px-4 py-3 `}>{message.text}</p>
                                    {/* <div ref={messagesEndRef}></div> */}
                                    <p className={`${message.role === 'other' ? 'self-start' : 'self-end'} mt-[2px] opacity-75 text-[9px] 2xl:text-[11px]`}>{message.time}</p>
                                </div>
                           )
                    })    
                }
                
            </div>
            <p className={`${userTyping !== '' ? 'bottom-[129px] 2xl:bottom-[79px] opacity-100' : '-bottom-[49px] opacity-0'} transition-all duration-300 px-3 py-1 text-[#7d7d7d] absolute `}>{userTyping} { userTyping ? 'is typing...' : ''}</p>
            <div className="fixed flex items-center justify-center w-[90%] 2xl:w-[40%]
             bottom-5 bg-[#fafafa] shadow-lg z-20 px-3 py-2 rounded-lg border-[1px] border-[#9b9b9b]">
                <input
                    type="text"
                    placeholder="Enter message here..."
                    value={userMessage}
                    onChange={e => {
                        setUserMessage(e.target.value)
                        socket.emit('typing', { boolVal: true, roomId, username})
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="px-3 py-2 w-full rounded-lg outline-none bg-transparent" />
                <i onClick={handleSendMessage} className="fa-solid fa-paper-plane px-4 hover:cursor-pointer"></i>
            </div>
        </div>
    )
}

export default BrainRot