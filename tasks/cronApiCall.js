const cron = require('node-cron');
const axios = require('axios');

const localhost =  "http://localhost:5000"
const serverhost = "https://fleximedia.onrender.com";

// Define your API endpoint and task
const apiEndpoint = `${serverhost}/api/posts/countPosts`;


const task = async () => {
  try {
    console.log("CRON CALLING");
    const response = await axios.get(apiEndpoint);
    console.log('Cron API call success, posts count: ',response.data.count);
  } catch (error) {
    console.error('Cron API request failed:', error);
  }
};

// Seting up the cron job to run the task every 10 minutes
cron.schedule('*/10 * * * *', task);

// 10 seconds
// cron.schedule('*/3 * * * * *', task);

