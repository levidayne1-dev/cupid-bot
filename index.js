import 'dotenv/config'
import { Client, GatewayIntentBits, Partials, Events } from 'discord.js'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CUPID_SYSTEM = `
You are Cupid Bot: a confident, smooth wingman.
Give short, high-quality dating messages.
1–3 options max. No cringe. Match tone.
If user pastes a convo, give the exact next text to send.
`

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
})

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`)
})

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return
  if (message.guild) return

  const input = message.content?.trim()
  if (!input) return

  await message.channel.sendTyping()

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CUPID_SYSTEM },
        { role: 'user', content: input },
      ],
      temperature: 0.85,
    })

    const reply = res.choices[0].message.content.trim()
    await message.reply(reply)
  } catch (err) {
    console.error(err)
    await message.reply('try again in a sec 👀')
  }
})

client.login(process.env.DISCORD_TOKEN)


