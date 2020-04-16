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
		}
	}, [userData]);

	if (!userData) {
		return <Login onUserLogged={onUserLogged} />
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
