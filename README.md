# Toastbot

Node/Express web app used to receive `/toast` commands from Softwire Slack.

Syntax for toasting in Slack is (e.g.):

```
/toast @Toastee1 [Untagged toastee] @Toastee2 [Another untagged toastee] toast text #hashtags :emoji:
```

Slack needs a reponse in 3000ms, so I'll probably rewrite this in python at some point soon and host it on a Lambda instead to make cold starts faster. If it doesn't get a response in that time the toasts still get sent fine, but the user gets a fairly horrible message that implies it hasn't worked.

At the moment it's running on Heroku hobby tier, but a Lambda 'receptionist' to satisfy the timeout and then call this app with a webhook to pass messages back to Slack would be a quick improvement to get it back to the free tier (or just rewrite the whole thing to be serverless).
