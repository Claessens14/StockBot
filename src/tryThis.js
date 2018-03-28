Display multiple buttons on messenger w/ bot framework



I would like to display multiple buttons to the user, I tried using the builder.prompts.choice method but it seems to affect my conversation logic.

    session.send(new builder.Prompts.choice(session, "Options", "ratios|chart|more|add", {listStyle: builder.ListStyle.button}));

I am using bot framework to connect to multiple channels and handle input/output but it does not handle my conversation logic, that is done separately by Watson. Would a hero card with no text or title, and just buttons work, because so I haven't got it working. Ideally, I would like a button click to be sent to the bot as an input text message. I am using node.js, and connecting to fb messenger.

    var hero = new builder.HeroCard(session)
      .title("title")
      .text("text")
      .buttons([
          builder.CardAction.imBack(session, "news", "news"),
          builder.CardAction.imBack(session, "news1", "news1"),
          builder.CardAction.imBack(session, "news2", "news2")
      ]);
    session.send(hero);

Any help would be much appreciated.
Thanks




