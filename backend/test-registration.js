const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const API_KEY = 'ibmssp_admin_secret_key_2024';

const testRegistration = async () => {
    try {
        console.log('Testing Student Registration...');
        const response = await axios.post(`${API_URL}/register`, {
            category: 'student',
            first_name: 'John',
            last_name: 'Doe',
            gender: 'Male',
            date_of_birth: '2000-01-01',
            email: `john.doe.${Date.now()}@example.com`,
            phone: '1234567890',
            address: '123 University Way',
            state: 'Lagos',
            institution_name: 'University of Lagos',
            course_of_study: 'Computer Science',
            level: '400',
            matric_number: 'CSC/2020/001',
            expected_graduation_year: 2024
        }, {
            headers: { 'x-api-key': API_KEY }
        });

        console.log('Success:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testRegistration();
