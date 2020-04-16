import io from "socket.io-client";
import Peer from "simple-peer";
import { useRef, useEffect, useState } from "react";
import { API } from "../../constants";

const STATUS = {
    NEW: 'new',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected'
};

const connectToBuddy = (localId, buddy) => {
	// 1. Create peer for this buddy
	// 2. Wait for a signal to be created for this peer
	// 3. Send message to server with my ID, buddy ID and my signal
	// 4. Wait for the buddy to send me his signal
	// 5. Save buddy's signal in this peer
}

export default function useRoom({ localUser, localStream }) {
    const localSocket = useRef();
    const localPeer = useRef();
    const localId = useRef();
    const [buddies, setBuddies] = useState([]);
    const [localSignal, setLocalSignal] = useState();
    
    useEffect(() => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: localStream
        });

        // We got the info others need to connect with me
        peer.on('signal', data => {
            setLocalSignal(data);
        });
    }, [localStream]);

    useEffect(() => {
        if (!localSignal) return false;

        // Establish connection with the server
        localSocket.current = io.connect(API.dealerServer);

        // Tell the server local user nickname
        localPeer.current = new Peer({
            initiator: true,
            trickle: false,
            stream: localStream
        });
        localSocket.current.emit('client_user-data', { 
			nickname: localUser.nickname,
			signal: localSignal
        });

        // The server gives our global ID
        localSocket.current.on('server__identificator', ({ id }) => {
            localId.current = id;
        });

        // The server sends a list of buddies in the room
        localSocket.current.on('server__buddies-list', ({ buddies }) => {
            setBuddies(buddies);
        });

        // The server sends info from a buddie that has joined
        localSocket.current.on('server__new-buddy', ({ buddy }) => {
            setBuddies([...buddies, { ...buddy, status: STATUS.CONNECTED }]);
        });

        // The server tells a buddy has disconnected
        localSocket.current.on('server__buddy-disconnected', ({ buddy }) => {
            setBuddies(buddies.map(_buddy => {
                if (_buddy.id === buddy.id) {
                    _buddy.status = STATUS.NEW;
                }
                return _buddy;
            }));
        });
    }, [localSignal]);

    useEffect(() => {
        buddies.forEach(buddy => {
            if (buddy.status === STATUS.NEW) {

            }
        });
    }, [buddies]);
}
