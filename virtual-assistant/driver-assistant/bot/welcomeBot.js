// Import required Bot Framework classes.
const { ActionTypes, ActivityHandler, CardFactory } = require('botbuilder');

// Welcomed User property name
const WELCOMED_USER = 'welcomedUserProperty';
const WelcomeCard = require('../resources/welcomeCard.json');

class WelcomeBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        // Creates a new user property accessor.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.',this.dialog);
            const userName = context.activity.from.name;
                await context.sendActivity(`Welcome ${ userName }.`);
            // Run the Dialog with the new message Activity.
            // await this.dialog.run(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            // await next();
        });
        // this.onMessage(async (context, next) => {

        //     // await context.sendActivity(`Welcome ${ userName }. See below for welcome card`);
        //     // await this.dialog.run(context, this.dialogState);
        //     // await next();


        //     // Read UserState. If the 'DidBotWelcomedUser' does not exist (first time ever for a user)
        //     // set the default to false.
        //     const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);

        //     // Your bot should proactively send a welcome message to a personal chat the first time
        //     // (and only the first time) a user initiates a personal chat with your bot.
        //     if (didBotWelcomedUser === false) {
        //         // The channel should send the user name in the 'From' object
        //         const userName = context.activity.from.name;
        //         // await context.sendActivity('You are seeing this message because this was your first message ever sent to this bot.');
        //         await context.sendActivity(`It is a good practice to welcome the user and provide personal greeting. For example, welcome ${ userName }.`);
        //         await this.dialog.run(context, this.dialogState);
        //         await next();

        //         // Set the flag indicating the bot handled the user's first message.
        //         await this.welcomedUserProperty.set(context, true);
        //     } else {
        //         // This example uses an exact match on user's input utterance.
        //         // Consider using LUIS or QnA for Natural Language Processing.
        //         const text = context.activity.text.toLowerCase();
        //         switch (text) {
        //         case 'hello':
        //         case 'hi':
        //             await context.sendActivity(`You said "${ context.activity.text }"`);
        //             break;
        //         case 'intro':
        //         case 'help':
        //             await this.sendIntroCard(context);
        //             break;
        //         default:
        //             await context.sendActivity(`This is a simple Welcome Bot sample. You can say 'intro' to
        //                                             see the introduction card. If you are running this bot in the Bot
        //                                             Framework Emulator, press the 'Start Over' button to simulate user joining a bot or a channel`);
        //         }
        //     }

        //     // By calling next() you ensure that the next BotHandler is run.
        //     await next();
        // });

        // Sends welcome messages to conversation members when they join the conversation.
        // Messages are only sent to conversation members who aren't the bot.
        this.onMembersAdded(async (context, next) => {
            // Iterate over all new members added to the conversation
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                    await context.sendActivity({ attachments: [welcomeCard] });
                    await dialog.run(context, conversationState.createProperty('DialogState'));
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save state changes
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    async sendIntroCard(context) {
        const card = CardFactory.heroCard(
            'Welcome to Bot Framework!',
            'Welcome to Welcome Users bot sample! This Introduction card is a great way to introduce your Bot to the user and suggest some things to get them started. We use this opportunity to recommend a few next steps for learning more creating and deploying bots.',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Get an overview',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Ask a question',
                    value: 'https://stackoverflow.com/questions/tagged/botframework'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Learn how to deploy',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-deploy-azure?view=azure-bot-service-4.0'
                }
            ]
        );

        await context.sendActivity({ attachments: [card] });
    }
}

module.exports.WelcomeBot = WelcomeBot;