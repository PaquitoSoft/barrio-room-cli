import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { STORAGE } from '../../constants';
import { storeValue } from '../../plugins/local-cache';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main
	},
	loginSelect: {
		marginBottom: '16px'
	},
	// from: {
	// 	width: '100%',
	// 	marginTop: theme.spacing(1)
	// },
	submit: {
		margin: theme.spacing(3, 0, 3)
	}
}));

function DeviceSelection({ availableDevices = [], deviceKind, label }) {
	const classes = useStyles();
	// const [device, setDevice] = useState();
	// const onChange = (event) => setDevice(event.target.value);

	return (
		<FormControl className={classes.loginSelect} fullWidth>
			<InputLabel id={`device-selection-${deviceKind}-label`}>{label}</InputLabel>
			<Select 
				labelId={`device-selection-${deviceKind}-label`}
				id={`device-selection-${deviceKind}`}
				name={`select-${deviceKind}`}
			>
				{
					availableDevices
						.filter(dev => dev.kind === deviceKind)
						.map(dev => (<MenuItem key={dev.deviceId} value={dev.deviceId}>{dev.label}</MenuItem>))
				}
			</Select>
		</FormControl>
	);
}

function Login({ onUserLogged }) {
	const classes = useStyles();
	const [availableDevices, setAvailableDevices] = useState([]);

	useEffect(() => {
		navigator.mediaDevices.enumerateDevices()
			.then(devices => {
				setAvailableDevices(devices);
			})
	}, []);


	const onSubmit = (event) => {
		event.preventDefault();
		const form = event.target;
		const userData = {
			nickname: event.target.nickname.value,
			videoDevice: availableDevices.find(device => device.deviceId === form['select-videoinput'].value),
			audioDevice: availableDevices.find(device => device.deviceId === form['select-audioinput'].value)
		}
		console.log({
			nickname: event.target.nickname.value,
			video: event.target['select-videoinput'].value,
			audio: event.target['select-audioinput'].value
		});
		
		if (form.remember.checked) {
			storeValue(STORAGE.USER_DATA, userData);
		}
		
		onUserLogged(userData);
	};

	return (
		<Container className="login" component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<form onSubmit={onSubmit}>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="nikname"
						label="Nickname"
						name="nickname"
						autoFocus
					/>
					<DeviceSelection
						key="video"
						label="Esoge tu cámara"
						deviceKind="videoinput"
						availableDevices={availableDevices}
					/>
					<DeviceSelection
						key="audio"
						label="Esoge tu micrófono"
						deviceKind="audioinput"
						availableDevices={availableDevices}
					/>
					<FormControlLabel
						control={<Checkbox name="remember" color="primary" />}
						label="Recuérdame"
					/>
					<Button 
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
					>Entrar</Button>
				</form>
			</div>
		</Container>
	);
}

export default Login;
