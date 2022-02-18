# Toastbot

Node/Express web app used to receive `/toast` commands from Softwire Slack.

Syntax for toasting in Slack is (e.g.):

```
/toast @Toastee1 [Untagged toastee] @Toastee2 [Another untagged toastee] toast text #hashtags :emoji:
```

Slack needs a reponse in 3000ms, so I'll probably rewrite this in python at some point soon and host it on a Lambda instead to make cold starts faster. If it doesn't get a response in that time the toasts still get sent fine, but the user gets a fairly horrible message that implies it hasn't worked.

At the moment it's running on Heroku free tier with a cron job during business hours to hit the healthcheck endpoint and keep it warm. The Heroku free tier is a Nice Thing™ that is intended for development work rather than finalised applications. I want to be respectful of this so don't like misusing it like this with a keep-warm job so this Node/Express app is only a temporary solution.
