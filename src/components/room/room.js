import React, { useEffect } from 'react';
import { Container } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import PeopleGrid from '../people-grid/people-grid';
import useRoom from './use-room';

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

function Room({ localUser, localStream, onLogout }) {
	const { state: { buddies }, actions: { logoutAction} } = useRoom({ localUser, localStream });

	console.log('Rendering buddies:', buddies);

    return (
        <Container component="main" maxWidth="xl">
			<header style={styles.header}>
                <h1 style={styles.title}>Ya estás en el barrio</h1>
                <HighlightOffIcon style={styles.close} onClick={() => {
					logoutAction();
					onLogout();
				}} />
            </header>
            <PeopleGrid localUser={localUser} localStream={localStream} buddies={buddies} />
        </Container>
    );
}

export default Room;
