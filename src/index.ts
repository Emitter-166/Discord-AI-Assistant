import {Client, DMChannel, IntentsBitField, Partials} from "discord.js";
import * as path from "path";
import {Configuration, OpenAIApi} from "openai";
import * as fs from 'fs';

require("dotenv").config({path: path.join(__dirname, ".env")});

const client = new Client({
    intents: [IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.DirectMessages],
    partials: [Partials.Channel]
})

client.once('ready', async () => {
    console.log("ready")
})

const allowed = ["671016674668838952"]
const name = "elysia";
const user_name = "Ox";

client.on('messageCreate', async (msg) => {
    const channel = msg.channel;
    if (msg.author.bot) return;
    if (msg.guild) return;

    if (!(allowed.some(v => v === msg.author.id))) return;

    if (msg.content.toLocaleLowerCase().startsWith("you are")) {
        const identity1 = msg.content.toLocaleLowerCase().replace("you are", `${name} is`);
        identity = identity1 + "\n"
        prompts = [];
        fs.writeFileSync("./identity.txt", identity1);
        msg.react("✅")
        return;
    }

    channel.sendTyping();
    if (msg.content === "") return;
    let sent = false;
    do {
        try {
            await msg.reply(await getResponse(msg.content))
            sent = true
        } catch (err) {
            console.log("err")
        }
    } while (!sent)
})
client.login(process.env.TOKEN);


const configuration = new Configuration({
    apiKey: process.env.KEY,
});
const openai = new OpenAIApi(configuration);


let prompts: string[] = [];

let identity = fs.readFileSync('./identity.txt').toString() + "\n";

const getResponse = async (text: string): Promise<string> => {
    prompts.push( user_name + ": " + text);
    text = "";
    if (prompts.length > 10) {
        prompts.shift();
    }
    prompts.forEach(str => text += (str + "\n"));
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${identity} ${text} \n ${name}:`,
        temperature: 0.8,
        max_tokens: 255,
        top_p: 0.3,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
    });
    prompts.push(name + ": " + response.data.choices[0].text as string);
    return response.data.choices[0].text as string
}
