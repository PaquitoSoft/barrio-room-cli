import React, { useEffect, useState } from 'react';
import { getValue } from './plugins/local-cache';
import Login from './components/login/login';
import { Container } from '@material-ui/core';
import { STORAGE } from './constants';
import PeopleGrid from './components/people-grid/people-grid';

function App() {
	const [userData, setUserData] = useState(getValue(STORAGE.USER_DATA));
	const [localStream, setLocalStream] = useState();

	const onUserLogged = (userData) => {
		console.log('User logged:', userData);
		setUserData(userData);
	};

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
		<div className="App">
			<Container component="main" maxWidth="xl">
				<h1>Ya estás en el barrio</h1>
				<PeopleGrid localUser={userData} localStream={localStream} buddies={[]} />
			</Container>
		</div>
	);
}

export default App;
