import React from 'react';
import { makeStyles, Grid, Paper } from '@material-ui/core';
import PersonVideo from '../person-video/person-video';

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

function PeopleGrid({ localUser, localStream, buddies }) {
	const classes = useStyles();
	const itemWidth = 4;
	
	return (
		<div className={classes.root}>
			<Grid container spacing={3}>
				<Grid item xs={itemWidth}>
					<Paper className={classes.personVideo}>
						<PersonVideo personData={localUser} stream={localStream} />
					</Paper>
				</Grid>
				<Grid item xs={itemWidth}>
					<Paper className={classes.personVideo}>
						<PersonVideo personData={localUser} stream={localStream} />
					</Paper>
				</Grid>
				<Grid item xs={itemWidth}>
					<Paper className={classes.personVideo}>
						<PersonVideo personData={localUser} stream={localStream} />
					</Paper>
				</Grid>
				<Grid item xs={itemWidth}>
					<Paper className={classes.personVideo}>
						<PersonVideo personData={localUser} stream={localStream} />
					</Paper>
				</Grid>
				<Grid item xs={itemWidth}>
					<Paper className={classes.personVideo}>
						<PersonVideo personData={localUser} stream={localStream} />
					</Paper>
				</Grid>

			</Grid>
		</div>
	);
};

export default PeopleGrid;