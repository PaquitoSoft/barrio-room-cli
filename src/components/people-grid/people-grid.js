import React from 'react';
import Logger from '../../plugins/logger';

import { makeStyles, Grid, Paper } from '@material-ui/core';
import PersonVideo from '../person-video/person-video';

const logger = new Logger('PeopleGrid');

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1
	},
	personVideo: {
		padding: theme.spacing(2),
		textAlign: 'center',
		color: theme.palette.text.secondary
	}
}));

function PeopleGrid({ localUser, localStream, buddies = [] }) {
	const classes = useStyles();
	const itemWidth = 4;

	logger.log(`Rendering with ${buddies.length} buddies`, buddies);
	// console.log(buddies);
	
	return (
		<div className={classes.root}>
			<Grid container spacing={3}>
				<Grid item xs={itemWidth}>
					<Paper className={classes.personVideo}>
						<PersonVideo personData={localUser} stream={localStream} />
					</Paper>
				</Grid>
				{
					buddies &&
					buddies.map(buddy => (
						<Grid key={buddy.id} item xs={itemWidth}>
							<Paper className={classes.personVideo}>
								<PersonVideo personData={buddy.userData} stream={buddy.stream} />
							</Paper>
						</Grid>
					))
				}
			</Grid>
		</div>
	);
};

export default PeopleGrid;
