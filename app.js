const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const mustacheExpress = require('mustache-express');

const PORT = process.env.PORT || 3000;
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const news_sources = require('./news_sources');

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use("/", express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, () => console.log(`App is running on ${PORT}.`));

app.get("/", (req, res) =>
  res.render("index")
);

app.post("/snews", function(req,res) {
  const input = req.body.text;
  let sorting = "top";
  let api = `https://newsapi.org/v1/articles?source=${input}&sortBy=${sorting}&apiKey=${NEWS_API_KEY}`;

  if(input !== "ars-technica" && input !== "associated-press" && input !== "bbc-news" && input !== "bbc-sports" && input !== "bloomberg" && input !== "business-insider" && input !== "buzzfeed" && input !== "cnbc" && input !== "cnn" && input !== "daily-news" && input !== "engadget" && input !== "entertainment-weekly" && input !== "espn" && input !== "financial-times" && input !== "four-four-two" && input !== "fox-sports" && input !== "google-news" && input !== "hacker-news" && input !== "ign" && input !== "independent" && input !== "mashable" && input !== "metro" && input !== "mirror" && input !== "mtv-news" && input !== "national-geographic" && input !== "new-scientist" && input !== "newsweek" && input !== "new-york-magazine" && input !== "nfl-news" && input !== "polygon" && input !== "recode" && input !== "reddit-r-all" && input !== "reuters" && input !== "sky-news" && input !== "sky-sports-news" && input !== "techcrunch" && input !== "techradar" && input !== "the-economist" && input !== "the-guardian-uk" && input !== "the-huffington-post" && input !== "the-lad-bible" && input !== "the-new-york-times" && input !== "the-next-web" && input !== "the-telegraph" && input !== "the-verge" && input !== "the-wall-street-journal" && input !== "the-washington-post" && input !== "time" && input !== "usa-today" && input !== "help") {
    res.send("Sorry, I didn't quite catch that. Try using the command [help] to see a list of acceptable commands!")
  } else if(input === "help") {
      slack_message = news_sources;
      res.send (slack_message);

  } else if(input === "the-next-web") {
       sorting = "latest";
       api = `https://newsapi.org/v1/articles?source=${input}&sortBy=${sorting}&apiKey=${NEWS_API_KEY}`;
       request(api, function(err, resp, body){
        body = JSON.parse(body);
        const source = body.source.toUpperCase();
        const articles_arr = body.articles;
        let article_list = articles_arr.map(function(element) {
          let article_title = element.title;
          let link = element.url;
          let description = element.description;
          let image = element.urlToImage
          return {
              color: "#ff0000",
              "mrkdwn_in": ["text"],
              title: article_title,
              title_link: link,
              text: description,
              thumb_url: image,
              footer: "/snews",
              footer_icon: "http://emojipedia-us.s3.amazonaws.com/cache/a3/dd/a3dd2044fded090033553d2c6a893d82.png"
            }
        })
        slack_message = {
          text: `*${source}*`,
          mrkdwn_in: "text",
          attachments: article_list
        }
        res.send(slack_message);
      })

  } else {
    request(api, function(err, resp, body){
        body = JSON.parse(body);
        const source = body.source.toUpperCase();
        const articles_arr = body.articles;
        let article_list = articles_arr.map(function(element) {
          let article_title = element.title;
          let link = element.url;
          let description = element.description;
          let image = element.urlToImage;
          return {
              color: "#ff0000",
              "mrkdwn_in": ["text"],
              title: article_title,
              title_link: link,
              text: description,
              thumb_url: image,
              footer: "/snews",
              footer_icon: "http://emojipedia-us.s3.amazonaws.com/cache/a3/dd/a3dd2044fded090033553d2c6a893d82.png"
            }
        })
        slack_message = {
          text: `*${source}*`,
          mrkdwn_in: "text",
          attachments: article_list
        }
        res.send(slack_message);
    })
  }
});

app.get("/slack", function(req,res) {
  let data = {
    form: {
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code: req.query.code
    }
  }
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Work on token below to redirect to actual slack channel
      let token = JSON.parse(body).access_token;
      res.redirect('https://snews-app.herokuapp.com/');
    }
  })
})
