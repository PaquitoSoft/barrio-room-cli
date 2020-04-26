import React, { useEffect, useState } from 'react';
import { getValue, removeValue } from './plugins/local-cache';
import Login from './components/login/login';
import { STORAGE } from './constants';
import Room from './components/room/room';

function App() {
	const [userData, setUserData] = useState(getValue(STORAGE.USER_DATA));
	const [localStream, setLocalStream] = useState();

	const onUserLogged = (userData) => {
		console.log('User logged:', userData);
		setUserData(userData);
	};

	const logout = () => {
		removeValue(STORAGE.USER_DATA);
		localStream.getAudioTracks()[0].stop();
		localStream.getVideoTracks()[0].stop();
		setUserData(null);
	}

	useEffect(() => {
		if (userData) {
			navigator.mediaDevices.getUserMedia({
				video: { deviceId: userData.videoDevice.deviceId }, 
				audio: { deviceId: userData.deviceId } 
			})
			.then(stream => {
				setLocalStream(stream);
			})
			.catch(console.error);
			/*
				HANDLING ERROR:
				if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
					//required track is missing 
				} else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
					//webcam or mic are already in use 
				} else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
					//constraints can not be satisfied by avb. devices 
				} else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
					//permission denied in browser 
				} else if (err.name == "TypeError" || err.name == "TypeError") {
					//empty constraints object 
				} else {
					//other errors 
				}
			*/
		}
	}, [userData]);

	if (!userData) {
		return <Login onUserLogged={onUserLogged} />
	}

	if (!localStream) {
		return (<div>Loading...</div>);
	}

	return (
		<Room 
			localUser={userData} 
			localStream={localStream}
			onLogout={logout}
		/>
	);
}

export default App;
