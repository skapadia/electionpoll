let Promise = require("bluebird");
let express = require('express');
let cheerio = require('cheerio');
let request = Promise.promisifyAll(require('request'));

let app = express();
let currentPollResults = {hillary: 0, trump: 0};
let getPollData = function (pageBody) {
    let $ = cheerio.load(pageBody);
    let hillaryScore = new Number($('#container > div.alpha-container > div > div.chart_wrapper > div.chart_header > table > tbody > tr:nth-child(1) > td > div.value > span').text());
    let trumpScore = new Number($('#container > div.alpha-container > div > div.chart_wrapper > div.chart_header > table > tbody > tr:nth-child(2) > td > div.value > span').text());
    return {hillary: hillaryScore, trump: trumpScore};
};

let updatePollData = function() {
    console.log("Retrieving poll data");
    request.getAsync('http://www.realclearpolitics.com/epolls/2016/president/us/general_election_trump_vs_clinton-5491.html')
        .then((page) => {
            currentPollResults = getPollData(page.body)
            console.log("Current Poll Results = " + JSON.stringify(currentPollResults));
        })
        .catch((err) => {
            console.log("Error retrieving web page!");
            console.log("Status Code: " + err.statusCode);
            console.log("Message: " + err.message);
        })
        .finally(() => {
            setTimeout(updatePollData, 1000 * 60 * 30);
        });
}

app.get('/', (req, res) => {
    res.send("US Presidential Election 2016 Poll Data");
});

app.get('/poll/latest', (req, res) => {
    res.send(currentPollResults);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
    updatePollData();
});
