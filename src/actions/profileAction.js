import axios from 'axios';
import { setAlert } from './alertAction';

import {
	GET_PROFILE,
	PROFILE_ERROR,
	CLEAR_PROFILE,
	ACCOUNT_DELETED,
	UPDATE_PROFILE,
	GET_PROFILES,
	GET_REPOS,
	NO_REPOS
} from './constants';

// Get current users profile
export const getCurrentProfile = () => async (dispatch) => {
	try {
		const res = await axios.get('https://developers-connector-backend.onrender.com/profile/me');

		dispatch({
			type: GET_PROFILE,
			payload: res.data
		});
	} catch (err) {
		dispatch({ type: CLEAR_PROFILE });
		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		});
	}
};

// Get all profiles
export const getProfiles = () => async (dispatch) => {
	dispatch({ type: CLEAR_PROFILE });

	try {
		const res = await axios.get('https://developers-connector-backend.onrender.com/profile');

		dispatch({
			type: GET_PROFILES,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		});
	}
};

// Get profile by ID
export const getProfileById = (userId) => async (dispatch) => {
	try {
		const res = await axios.get(`/profile/user/${userId}`);

		dispatch({
			type: GET_PROFILE,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		});
	}
};

// Get Github repos
export const getGithubRepos = (username) => async (dispatch) => {
	try {
		const res = await axios.get(`/profile/github/${username}`);

		dispatch({
			type: GET_REPOS,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: NO_REPOS
		});
	}
};

// Create or update profile
export const createProfile = (formData, history, edit = false) => async (dispatch) => {
	try {
		const res = await axios.post('https://developers-connector-backend.onrender.com/profile', formData);

		dispatch({
			type: GET_PROFILE,
			payload: res.data
		});

		dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

		if (!edit) {
			history.push('https://developers-connector-backend.onrender.com/dashboard');
		}
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		});
	}
};

// Add Experience
export const addExperience = (formData, history) => async (dispatch) => {
	try {
		const res = await axios.put('https://developers-connector-backend.onrender.com/profile/experience', formData);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});

		dispatch(setAlert('Experience details added successfully', 'success'));

		history.push('https://developers-connector-backend.onrender.com/dashboard');
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		});
	}
};

// Add Education
export const addEducation = (formData, history) => async (dispatch) => {
	try {
		const res = await axios.put('https://developers-connector-backend.onrender.com/profile/education', formData);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});

		dispatch(setAlert('Education details added successfully', 'success'));

		history.push('https://developers-connector-backend.onrender.com/dashboard');
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		});
	}
};

//delete Experience

export const deleteExperience = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/profile/experience/${id}`);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});
		dispatch(setAlert('Removed successfully', 'danger'));
	} catch (error) {
		dispatch({
			type: PROFILE_ERROR,
			payload: { message: error.response.statusText, status: error.response.status }
		});
	}
};

//delete Education

export const deleteEducation = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/profile/education/${id}`);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});
		dispatch(setAlert('Removed successfully', 'danger'));
	} catch (error) {
		dispatch({
			type: PROFILE_ERROR,
			payload: { message: error.response.statusText, status: error.response.status }
		});
	}
};

// Delete account & profile
export const deleteAccount = () => async (dispatch) => {
	if (window.confirm('Are you sure? This CANNOT be undone!')) {
		try {
			await axios.delete('https://developers-connector-backend.onrender.com/profile');

			dispatch({ type: CLEAR_PROFILE });
			dispatch({ type: ACCOUNT_DELETED });

			dispatch(setAlert('Your account has been deleted permanently', 'success'));
		} catch (err) {
			dispatch({
				type: PROFILE_ERROR,
				payload: { message: err.response.statusText, status: err.response.status }
			});
		}
	}
};
