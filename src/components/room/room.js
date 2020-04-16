import React, { useEffect } from 'react';
import { Container } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import PeopleGrid from '../people-grid/people-grid';

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
    return (
        <Container component="main" maxWidth="xl">
			<header style={styles.header}>
                <h1 style={styles.title}>Ya estás en el barrio</h1>
                <HighlightOffIcon style={styles.close} onClick={onLogout} />
            </header>
            <PeopleGrid localUser={localUser} localStream={localStream} buddies={[]} />
        </Container>
    );
}

export default Room;
