const axios = require('axios');
const config = require('../config.json');

module.exports = async function(){
    const url = "https://newsapi.org/v2/everything?domains="+config.urls.join(",")+"&apiKey="+process.env.NEWS_API_KEY;
    const res = await axios.get(url)
    if(res.status !== 200){
        console.error("Error fetching news:", res.status, res.statusText);
        return;
    }
    const articles = res.data.articles;
    if(!articles || articles.length === 0){
        console.log("No articles found.");
        return;
    }
    console.log("Fetched " + articles.length + " articles.");
    return articles


}