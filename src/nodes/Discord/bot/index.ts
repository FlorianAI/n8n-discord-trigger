import { Client, GatewayIntentBits } from 'discord.js'
import ipc from 'node-ipc'
import { getNodeId } from '../helpers';
import guildMemberAddEvent from './discordClientEvents/guildMemberAdd.event'
import guildMemberRemoveEvent from './discordClientEvents/guildMemberRemove.event'
import guildMemberUpdateEvent from './discordClientEvents/guildMemberUpdate.event'
import interactionCreateEventCmd from './discordClientEvents/interactionCreateCmd.event'
import interactionCreateEventUI from './discordClientEvents/interactionCreateUI.event'
import messageCreateEvent from './discordClientEvents/messageCreate.event'
import presenceUpdateEvent from './discordClientEvents/presenceUpdate.event'
import threadCreateEvent from './discordClientEvents/threadCreate.event'
import { addLog } from './helpers'
import botStatusIpc from './ipcEvents/botStatus.ipc'
import credentialsIpc from './ipcEvents/credentials.ipc'
import executionIpc from './ipcEvents/execution.ipc'
import listChannelsIpc from './ipcEvents/listChannels.ipc'
import listRolesIpc from './ipcEvents/listRoles.ipc'
import sendActionIpc from './ipcEvents/sendAction.ipc'
import sendMessageIpc from './ipcEvents/sendMessage.ipc'
import sendPromptIpc from './ipcEvents/sendPrompt.ipc'
import triggerIpc from './ipcEvents/trigger.ipc'

export default function () {
  const NODE_ID = getNodeId()
  console.log(`Starting Discord Bot with NodeId: ${NODE_ID}`);
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
    ],
    allowedMentions: {
      parse: ['roles', 'users', 'everyone'],
    },
  })

  client.on('ready', () => {
    addLog(`Logged in as ${client.user?.tag} with NodeId: ${NODE_ID}`, client)
    registerNodeInstance(NODE_ID) // Înregistrăm instanța botului în state.ts
  })

  // listen to users changing their status events
  presenceUpdateEvent(client)

  // listen to users updates (roles)
  guildMemberUpdateEvent(client)

  // user joined a server
  guildMemberAddEvent(client)

  // user leaving a server
  guildMemberRemoveEvent(client)

  // the bot listen to all messages and check if it matches a referenced trigger
  messageCreateEvent(client)

  // the bot listen to all threads and check if it matches a referenced trigger
  threadCreateEvent(client)

  // the bot listen to all interactions (button/select) and check if it matches a waiting prompt
  interactionCreateEventUI(client)

  // the bot listen to all interactions (slash commands) and check if it matches a referenced trigger
  interactionCreateEventCmd(client)

  ipc.config.id = 'bot-${NODE_ID}'
  ipc.config.retry = 1500

  // nodes are executed in a child process, the Discord bot is executed in the main process
  // so it's not stopped when a node execution end
  // we use ipc to communicate between the node execution process and the bot
  // ipc is serving in the main process & childs connect to it using the ipc client
  ipc.serve(function () {
    addLog(`IPC bot server started with NodeId: ${NODE_ID}`, client)
    credentialsIpc(ipc, client, NODE_ID)

    // when a trigger is activated or updated, we get the trigger data et parse it
    // so when a message is received we can check if it matches a trigger
    triggerIpc(ipc, client, NODE_ID)

    // used to handle channels selection in the n8n UI
    listChannelsIpc(ipc, client, NODE_ID)

    // used to handle roles selection in the n8n UI
    listRolesIpc(ipc, client, NODE_ID)

    // used send button prompt or select prompt in a channel
    sendPromptIpc(ipc, client, NODE_ID)

    // used to send message to a channel
    sendMessageIpc(ipc, client, NODE_ID)

    // used to perform an action in a channel
    sendActionIpc(ipc, client, NODE_ID)

    // used to change the bot status
    botStatusIpc(ipc, client, NODE_ID)

    // used to initiate node execution (message, prompt)
    executionIpc(ipc, client, NODE_ID)
  })

  ipc.server.start()
  // Gestionăm oprirea corectă a botului când nodul este dezactivat
  process.on('SIGINT', () => {
    unregisterNodeInstance(NODE_ID)
    client.destroy()
    console.log(`Bot with NodeId ${NODE_ID} has been stopped.`)
    process.exit()
  })
}
