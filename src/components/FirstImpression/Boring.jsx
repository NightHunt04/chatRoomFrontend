import { useState } from "react" 
import { useNavigate } from "react-router-dom"
import { createRoom, joinRoom } from "../../utils/socketIntegration"
import generateShortId from 'ssid'

function Boring() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [joinRoomName, setJoinRoomName] = useState('')
    const [err, setErr] = useState(false)
    const [isRoomTaken, setIsRoomTaken] = useState(false)
    const [isRoomCreated, setIsRoomCreated] = useState(false)
    const [isRoomNotThere, setIsRoomNotThere] = useState(false)
    let socket

    const handleCreate = async () => {
        setErr(false)
        setIsRoomCreated(false)
        setIsRoomNotThere(false)

        if(username) {
            console.log('creating')
            const roomId = generateShortId(6)

            socket = await createRoom({ roomId, username })

            if(socket) {
                socket.on('room-creation-response', (response) => {
                    console.log(response)
                    if(response.status === 2)
                        setIsRoomTaken(true)
    
                    else if(response.status === 1){
                        setIsRoomCreated(true)
                        
                        setTimeout(() => {
                            setIsRoomCreated(false)
                            navigate('chat', {
                                state: {
                                    username,
                                    roomId,
                                    joined: false,
                                }
                            })
                        }, 2000)
                    }
                })
            }
        }
        else
            setErr(true)
    }

    const handleJoin = async () => {
        setErr(false)
        setIsRoomCreated(false)
        setIsRoomNotThere(false)

        if(username && joinRoomName) {
            console.log('joining')
            
            socket = await joinRoom({ joinRoomName, username })

            if(socket) {
                socket.on('room-joining-response', (response) => {
                    console.log(response)
                    if(response.status === 2)
                        setIsRoomNotThere(true)
                    
                    else if(response.status === 1) {
                        navigate('chat', {
                            state: {
                                username,
                                roomId: joinRoomName,
                                joined: true,
                            }
                        })
                    }
                })
            }
        }
        else
            setErr(true)
    }

    return (
        <div className="flex flex-col items-center justify-center px-3 py-2 w-full h-full">
            {
                isRoomCreated && <p className="px-3 py-2 rounded-lg absolute top-14 bg-[#ceffb8]">Successfully created your faltu room!</p>
            }

            <h2 className="text-[21px] 2xl:text-[25px] font-semibold">Chat<span className="text-[#2337c6]">Room</span></h2>
            <p className="pb-4 2xl:pb-8 px-6 text-[#454545] text-center">All text messages from the user are encrypted and safe, or not, I don't know?</p>
            <div className="rounded-lg shadow-lg border-[1px] border-[#ececec] flex flex-col items-start justify-start px-9 py-6">
                <p className="my-5">Fill the below information before spamming your brain-rotting words in the chat room. Thank you.</p>
                <div className="flex flex-col relative items-center justify-center mt-3 w-full">
                    <input 
                        id="username"
                        type="text" 
                        placeholder="Pick any Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && document.getElementById('createRoom').focus()}
                        className="peer outline-none border-[1px] border-[#ddd] rounded-lg px-4 py-2 w-full placeholder-transparent focus:border-[#4d86d0]"
                        />
                    <label htmlFor="username" className="absolute text-[13px] text-[#646464] px-1 left-3 -top-4 peer-placeholder-shown:text-[13px] 2xl:peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-2 transition-all duration-300">Pick any Username</label>
                </div>

                <p className="mt-12">Either create a room or join a room.</p>

                <div className="flex items-start justify-center mt-5 gap-4 2xl:gap-10 w-full">
                    <button onClick={handleCreate} className="w-full py-2 px-4 2xl:px-9 rounded-lg text-white font-medium outline-none border-none bg-[#0504aa] hover:opacity-75">Create a room</button>
                </div>

                <div className="w-full flex items-center justify-center border-t-[1px] border-[#ddd] my-10 relative">
                    <p className="absolute bg-white px-2 text-[#626262]">Or</p>
                </div>

                <div className="flex items-start justify-center gap-4 2xl:gap-10 w-full pb-6">
                    <div className="flex flex-col relative items-center justify-center w-full">
                        <input 
                            id="joinRoom"
                            type="text" 
                            placeholder="Join a room (room name)"
                            value={joinRoomName}
                            onChange={e => setJoinRoomName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleJoin()}
                            className="peer outline-none border-[1px] border-[#ddd] rounded-lg px-4 py-2 w-full placeholder-transparent focus:border-[#4d86d0]"
                            />
                        <label htmlFor="joinRoom" className="absolute text-[13px] text-[#646464] px-1 left-3 -top-4 peer-placeholder-shown:text-[13px] 2xl:peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-2 transition-all duration-300">Join a room (room name)</label>
                    </div>
                    <button onClick={handleJoin} id="join" className="py-2 px-4 2xl:px-9 rounded-lg text-white font-medium outline-none border-none bg-[#0504aa] hover:opacity-75">Join</button>
                </div>

                {
                    err && <p className="px-3 py-2 bg-[#ffb5b5] rounded-lg">An error occured, make sure to enter the username and either create or join a room by providing it's name.</p>
                }

                {
                    isRoomTaken && <p className="px-3 py-2 bg-[#ffb5b5] rounded-lg">Oops! Room name is already taken, try another one.</p>
                }

                {
                    isRoomNotThere && <p className="px-3 py-2 bg-[#ffb5b5] rounded-lg">Invalid, No such room id found!</p>
                }
            </div>
        </div>
    )
}

export default Boring