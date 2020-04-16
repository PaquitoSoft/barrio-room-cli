import React, { useEffect, useState } from 'react';
import { getValue, removeValue } from './plugins/local-cache';
import Login from './components/login/login';
import { Container } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { STORAGE } from './constants';
import PeopleGrid from './components/people-grid/people-grid';

const styles = {
	header: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	title: {
		display: 'inline-block'
	},
	close: {
		fontSize: 50,
		marginTop: 21,
		cursor: 'pointer'
	}
};

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
		<div className="App">
			<Container component="main" maxWidth="xl">
				<header style={styles.header}>
					<h1 style={styles.title}>Ya estás en el barrio</h1>
					<HighlightOffIcon style={styles.close} onClick={logout} />
				</header>
				<PeopleGrid localUser={userData} localStream={localStream} buddies={[]} />
			</Container>
		</div>
	);
}

export default App;
