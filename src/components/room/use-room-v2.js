import io from "socket.io-client";
import Peer from "simple-peer";
import { useRef, useEffect, useState, useReducer } from "react";
import { API, EVENTS } from "../../constants";
import Logger from '../../plugins/logger';
import Buddy from "../../models/buddy";

const logger = new Logger('use-room');

const ACTIONS = {
	NEW_BUDDY: 'new_buddy',
	UPDATE_BUDDY: 'update_buddy',
	UPDATE_BUDDIES: 'update_buddies',
	REMOVE_BUDDY: 'remove_buddy'
}

function callBuddies({ buddies, localStream, localUser, socket, dispatch }) {
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
			socket.emit(EVENTS.client.CALL_BUDDY, {
				caller: {
					id: localUser.id,
					nickname: localUser.nickname
				},
				callerSignal: signal,
				buddyId: buddyInfo.id
			});
		});

		peer.on('stream', stream => {
			logger.log(`STREAM received from buddy ${buddyInfo.nickname}`);
			buddy.setStream(stream);
			dispatch({ type: ACTIONS.UPDATE_BUDDY, payload: { buddy } });
		});

		let counter = 0;
		socket.on(EVENTS.server.CALL_ACCEPTED, ({ buddy: _buddy, buddySignal }) => {
			logger.log(`Call accepted by buddy ${_buddy.nickname}`);
			// TODO SuperChamba!!!!!!!!!!!!!!!!!!!!
			logger.log('Counter = ', counter++);
			if (counter === 1) {
				peer.signal(buddySignal);
				buddy.setPeer(peer);
				logger.log('Buddy signal set into peer for buddy', buddySignal);
				dispatch({ type: ACTIONS.UPDATE_BUDDY, payload: { buddy } });
			}
		});

		buddy.setPeer(peer);
		dispatch({ type: ACTIONS.NEW_BUDDY, payload: { buddy } });
	});
}

function acceptCall({ buddyInfo, buddySignal, localUser, localStream, socket, dispatch }) {
	logger.log(`Buddy is callling ${buddyInfo.nickname}`, buddyInfo, localStream);
	const buddy = new Buddy(buddyInfo);

	const peer = new Peer({
		initiator: false,
		trickle: false,
		stream: localStream
	});

	peer.on('signal', signal => {
		logger.log('Local signal acquired. Lets accept call from', buddyInfo.nickname);
		socket.emit(EVENTS.client.ACCEPT_CALL, {
			callee: {
				id: localUser.id,
				nickname: localUser.nickname
			},
			buddy: buddyInfo,
			calleeSignal: signal
		});
	});

	peer.on('stream', stream => {
		logger.log('STREAM received from buddy:', buddyInfo.nickname);
		buddy.setStream(stream);
		dispatch({ type: ACTIONS.UPDATE_BUDDY, payload: { buddy } });
	});

	peer.signal(buddySignal);
	buddy.setPeer(peer);
	logger.log('Buddy signal set on local Peer', buddySignal);
	logger.log('Add buddy to list:', buddy.userData);
	dispatch({ type: ACTIONS.NEW_BUDDY, payload: { buddy } });
}

function buddiesReducer(buddies, action) {
	switch (action.type) {
		case ACTIONS.NEW_BUDDY:
			return [...buddies, action.payload.buddy];
		case ACTIONS.UPDATE_BUDDY:
			const _buddy = action.payload.buddy;
			return buddies.map(buddy => {
				if (buddy.userData.id === _buddy.userData.id) {
					return { ...buddy, ..._buddy };
				}
				return buddy;
			});
		case ACTIONS.UPDATE_BUDDIES:
			return [...buddies];
		case ACTIONS.REMOVE_BUDDY:
			return buddies.filter(buddy => buddy.userData.id !== action.payload.buddy.userData.id);
		default:
			logger.log('Unknow action. Return same state. Action type:', action.type);
			return buddies;
	}
}

export default function useRoom({ localUser, localStream }) {
	const [buddies, dispatch] = useReducer(buddiesReducer, []);
	const socketRef = useRef();
	
	logger.log('RENDERING HOOK with buddies:', buddies);

	useEffect(() => {
		// Establish connection with the server
		logger.log('Connecting to server');
		const socket = io.connect(API.dealerServer, {
			rejectUnauthorized: false
		});

		// Tell the server I'm ready and send my info
		logger.log('Send local data to server');
		socket.emit(EVENTS.client.READY, { 
			nickname: localUser.nickname
		});

		// The server gives our global ID
		socket.on(EVENTS.server.CLIENT_ID_GENERATED, ({ id }) => {
			logger.log('Server generated ID received from server:', id);
			// localId = id;
			// localId = id;
			localUser.id = id;
		});

		// The server sends a list of buddies in the room
		socket.on(EVENTS.server.BUDDIES_LIST, ({ buddies }) => {
			callBuddies({ buddies, localStream, localUser, socket, dispatch });
		});

		// The server sends info from a buddie that has joined
		socket.on(EVENTS.server.NEW_BUDDY, ({ buddy }) => {
			logger.log('New buddy connected:', buddy);
		});

		// A buddy is calling me
		socket.on(EVENTS.server.BUDDY_CALLING, ({ buddy: buddyInfo, buddySignal }) => {
			acceptCall({ buddyInfo, buddySignal, localUser, localStream, socket, dispatch });
		});

		// The server tells a buddy has disconnected
		socket.on(EVENTS.server.BUDDY_DISCONNECTED, ({ buddy: buddyInfo }) => {
			logger.log('Buddy disconnected:', buddyInfo);
			// setBuddies(buddies.filter(buddy => buddy.userData.id !== buddyInfo.id));
			dispatch({ type: ACTIONS.REMOVE_BUDDY, payload: { buddy: new Buddy(buddyInfo) } });
		});

		socketRef.current = socket;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const logoutAction = () => {
		socketRef.current.close();
	};

	return {
		state: { buddies },
		actions: { logoutAction }
	}
}
