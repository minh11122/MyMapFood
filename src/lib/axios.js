import axios from 'axios';

const baseURL = 'https://backmymapfood.onrender.com/api/'; 

// const baseURL = "http://localhost:9999/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    
  },
});

export default api;