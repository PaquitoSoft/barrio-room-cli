import io from "socket.io-client";
import Peer from "simple-peer";
import { useRef, useEffect, useState } from "react";
import { API } from "../../constants";
import Logger from '../../plugins/logger';
import Buddy from "../../models/buddy";

const logger = new Logger('use-room');

const STATUS = {
	NEW: 'new',
	CONNECTING: 'connecting',
	CONNECTED: 'connected',
	DISCONNECTED: 'disconnected'
};

const events = {
	client: {
		READY: 'client::ready',
		CALL_BUDDY: 'client::call-buddy',
		ACCEPT_CALL: 'client::accept-call'
	},
	server: {
		CLIENT_ID_GENERATED: 'server::client-id-generated',
		BUDDIES_LIST: 'server::buddies-list',
		NEW_BUDDY: 'server::new-buddy',
		BUDDY_DISCONNECTED: 'server::buddy-disconnected',
		BUDDY_CALLING: 'server::buddy-calling',
		CALL_ACCEPTED: 'server::call-accepted'
	}
};

export default function useRoom({ localUser, localStream }) {
	const localSocket = useRef();
	// const localPeer = useRef();
	const localId = useRef();
	// const localSignal = useRef();
	const [buddies, setBuddies] = useState([]);
	// const [localSignal, setLocalSignal] = useState();
	
	logger.log('RENDERING HOOK with buddies:', buddies);

	useEffect(() => {
		// Establish connection with the server
		logger.log('Connecting to server');
		localSocket.current = io.connect(API.dealerServer, {
			rejectUnauthorized: false
		});

		// Tell the server I'm ready and send my info
		logger.log('Send local data to server');
		localSocket.current.emit(events.client.READY, { 
			nickname: localUser.nickname
		});

		// The server gives our global ID
		localSocket.current.on(events.server.CLIENT_ID_GENERATED, ({ id }) => {
			logger.log('Server generated ID received from server:', id);
			localId.current = id;
		});

		// The server sends a list of buddies in the room
		localSocket.current.on(events.server.BUDDIES_LIST, ({ buddies }) => {
			logger.log('Buddies received from server:', buddies);

			buddies.forEach(buddyInfo => {
				const buddy = new Buddy(buddyInfo);

				// Create a peer to initiate de communication with this buddy
				// I'm the caller and I need a localPeer for every buddy
				const peer = new Peer({
					initiator: true,
					trickle: false,
					stream: localStream
				});
				
				peer.on('signal', signal => {
					logger.log(`Local signal acquired for buddy ${buddyInfo.nickname}`);
					logger.log(`Calling buddyInfo ${buddy.nickname}`);
					// Now I tell the buddy I want to communicate with him
					localSocket.current.emit(events.client.CALL_BUDDY, {
						caller: {
							id: localId.current,
							nickname: localUser.nickname
						},
						callerSignal: signal,
						buddyId: buddyInfo.id
					});
				});

				peer.on('stream', stream => {
					logger.log(`STREAM received from buddy ${buddyInfo.nickname}`);
					// buddy.stream = stream;
					buddy.setStream(stream);
					// setBuddies([...buddies]);
					setBuddies(_buddies => [..._buddies]);
				});

				localSocket.current.on(events.server.CALL_ACCEPTED, ({ buddy: _buddy, buddySignal }) => {
					logger.log(`Call accepted by buddy ${_buddy.nickname}`);
					let counter = 0;
					// Find this buddy's peer and set this signal
					// This is the way I establish de connected once he already did
					setBuddies(_buddies => {
						logger.log('Counter = ', counter++);
						// logger.log('Current buddies:', _buddies.length);
						// const _buddy = _buddies.find(_buddy => _buddy.id === buddy.id);
						// logger.log('Buddy object found:', _buddy);
						// if (_buddy) {
						// 	_buddy.peer.signal(buddySignal);
						// 	logger.log('Buddy signal set into peer for buddy', _buddy.peer.nickname);
						// }
						// TODO SuperChamba!!!!!!!!!!!!!!!!!!!!
						if (counter === 1) {
							peer.signal(buddySignal);
							logger.log('Buddy signal set into peer for buddy', buddySignal);
						}
						// console.trace();
						return [..._buddies];
					})
				});

				// buddy.peer = peer;
				buddy.setPeer(peer);
				// setBuddies([...buddies, buddy]);
				setBuddies(_buddies => [..._buddies, buddy]);
			});

			// setBuddies([...buddies]);
		});

		// The server sends info from a buddie that has joined
		localSocket.current.on(events.server.NEW_BUDDY, ({ buddy }) => {
			logger.log('New buddy connected:', buddy);
		});

		// A buddy is calling me
		localSocket.current.on(events.server.BUDDY_CALLING, ({ buddy: buddyInfo, buddySignal }) => {
			logger.log(`Buddy is callling ${buddyInfo.nickname}`, buddyInfo, localStream);
			const buddy = new Buddy(buddyInfo);

			const peer = new Peer({
				initiator: false,
				trickle: false,
				stream: localStream
			});

			peer.on('signal', signal => {
				logger.log('Local signal acquired. Lets accept call from', buddyInfo.nickname);
				localSocket.current.emit(events.client.ACCEPT_CALL, {
					callee: {
						id: localId.current,
						nickname: localUser.nickname
					},
					buddy: buddyInfo,
					calleeSignal: signal
				});
			});

			peer.on('stream', stream => {
				logger.log('STREAM received from buddy:', buddyInfo.nickname);
				buddy.setStream(stream);
				logger.log('Current buddy:', buddy);
				logger.log('Current buddies:', buddies);
				buddies.forEach(b => {
					logger.log('buddy from the curent list:', b);
					logger.log('Is the same buddy?', b === buddy);
				});
				setBuddies(_prevBuddies => {
					logger.log('PREV buddies', _prevBuddies);
					return [..._prevBuddies];
				});
			});

			peer.signal(buddySignal);
			buddy.setPeer(peer);
			logger.log('Buddy signal set on local Peer', buddySignal);
			logger.log('Add buddy to list:', buddy.userData);
			setBuddies([...buddies, buddy]);
		});

		// The server tells a buddy has disconnected
		localSocket.current.on(events.server.BUDDY_DISCONNECTED, ({ buddy: buddyInfo }) => {
			logger.log('Buddy disconnected:', buddyInfo);
			setBuddies(buddies.filter(buddy => buddy.userData.id !== buddyInfo.id));
		});
	}, []);

	const logoutAction = () => {
		localSocket.current.close();
	};

	return {
		state: { buddies },
		actions: { logoutAction }
	}
}
