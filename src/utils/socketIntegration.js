import { io } from 'socket.io-client'

let socket
export async function createRoom({ roomId, username }) {
    if(socket)
        socket.disconnect()

    socket = io(import.meta.env.VITE_APP_SOCKET_URL)

    // joining the user into a room by the name of -> createdRoomName
    await socket.emit('create-room', { roomId, username })
    console.log('room created')

    return socket
} 

export async function joinRoom({ joinRoomName, username }) {
    if(socket)
        socket.disconnect()
    
    socket = io(import.meta.env.VITE_APP_SOCKET_URL)

    await socket.emit('join-room', { joinRoomName, username })

    return socket
}

export function useSocket() {
    return socket
}
