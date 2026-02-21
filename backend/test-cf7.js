const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const API_KEY = 'ibmssp_admin_secret_key_2024';

const testCF7Registration = async () => {
    try {
        console.log('Testing CF7 Student Mapping...');
        const studentRes = await axios.post(`${API_URL}/register`, {
            'your-name': 'Jane Student',
            'your-email': `jane.${Date.now()}@test.com`,
            'tel-290': '08012345678',
            'your-school': 'Lagos State University',
            'your-course': 'Law'
        }, { headers: { 'x-api-key': API_KEY } });
        console.log('Student Success:', studentRes.data.success, 'Generated ID:', studentRes.data.data.public_id);

        console.log('\nTesting CF7 Organization Mapping...');
        const orgRes = await axios.post(`${API_URL}/register`, {
            'your-organization': 'Global Tech Ltd',
            'tel-766': '09011122233',
            'your-email': `contact@globaltech${Date.now()}.com`,
            'date-394': '2021'
        }, { headers: { 'x-api-key': API_KEY } });
        console.log('Org Success:', orgRes.data.success, 'Generated ID:', orgRes.data.data.public_id);

        console.log('\nTesting CF7 Graduate Mapping...');
        const gradRes = await axios.post(`${API_URL}/register`, {
            'full-name': 'Bob Graduate',
            'email-address': `bob.${Date.now()}@test.com`,
            'school-name': 'University of Ibadan',
            'degree': 'B.Sc',
            'course': 'Biology',
            'graduation-year': '2022',
            'study-duration': '4 years'
        }, { headers: { 'x-api-key': API_KEY } });
        console.log('Graduate Success:', gradRes.data.success, 'Generated ID:', gradRes.data.data.public_id);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testCF7Registration();
