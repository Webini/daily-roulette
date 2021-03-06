### Redirection

Default install path `/slack/install`
Default redirect path `/slack/oauth_redirect`
Default event path `/slack/events`

Slack manifest :

```yml
_metadata:
  major_version: 1
  minor_version: 1
display_information:
  name: DailyRoulette
features:
  bot_user:
    display_name: DailyRoulette
    always_online: false
  slash_commands:
    - command: /droulette-configure
      url: <host>/slack/events
      description: Install or / configure existing daily roulette bot
      should_escape: false
    - command: /droulette-estimate
      url: <host>/slack/events
      description: Estimate a new issue
      usage_hint: <Issue number, or description>
      should_escape: true
    - command: /droulette-remove
      url: <host>/slack/events
      description: Remove daily roulette from current channel
      should_escape: false
    - command: /droulette-start
      url: <host>/slack/events
      description: Force daily meeting startup
      should_escape: false
    - command: /droulette-stop
      url: <host>/slack/events
      description: Stop current daily meeting
      should_escape: false
oauth_config:
  redirect_urls:
    - <host>/slack/oauth_redirect
  scopes:
    bot:
      - commands
      - chat:write
      - channels:read
      - channels:join
      - channels:manage
      - users:read
settings:
  event_subscriptions:
    request_url: <host>/slack/events
    user_events:
      - app_uninstalled
    bot_events:
      - app_uninstalled
      - channel_left
  interactivity:
    is_enabled: true
    request_url: <host>/slack/events
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```
