const createApiClient = () => {
	return {
		getPackage: (packageRequest) => {
			return axios.post(`http://localhost:3000/api/customer`, packageRequest).then((res) => res.data);
        },

		updatePackage: (packageRequest) => {
			return axios.post(`http://localhost:3000/api/shipper`, packageRequest).then((res) => res.data);
        },

		createPackage: (packageRequest) => {
			return axios.post(`http://localhost:3000/api/creator`, packageRequest).then((res) => res.data);
        },
		
		// login: (logInRequest) => {
		// 	return axios.post(`${baseUrl}/api/users/login`, logInRequest).then((res) => res.data);
		// },

		// deleteUser: (deleteRequest) => {
		// 	return axios.delete(`${baseUrl}/api/users`, {data: deleteRequest}).then((res) => res.data);
		// },

		// uploadUserData: (domain, uploadRequest) => {
		// 	return axios.put(`${baseUrl}/api/data/${domain}`, uploadRequest).then((res) => res.data);
		// },

		// uploadAllUserData: (uploadRequest) => {
		// 	return axios.put(`${baseUrl}/api/data`, uploadRequest).then((res) => res.data);
		// }
	}
}