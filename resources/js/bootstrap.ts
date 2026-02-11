import axios from 'axios';

// Set up axios defaults for CSRF
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Get CSRF token from meta tag or cookie
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found in meta tag');
}

// Automatically handle 419 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            console.warn('CSRF token expired, reloading page...');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default axios;
