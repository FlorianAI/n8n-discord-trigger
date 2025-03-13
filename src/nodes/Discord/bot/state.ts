const state: {
  ready: boolean
  login: boolean
  testMode: boolean
  clientId: string
  token: string
  baseUrl: string
  triggers: {
    [key: string]: {
      webhookId: string
      channelIds: string[]
      roleIds: string[]
      roleUpdateIds: string[]
      type: string
      pattern?: string
      value?: string
      name?: string
      description?: string
      commandFieldType?: string
      commandFieldDescription?: string
      commandFieldRequired?: boolean
      caseSensitive?: boolean
      botMention?: boolean
      placeholder?: string
      active: boolean
      presence?: string
      nick?: string
      interactionMessageId?: string
    }
  }
  channels: {
    [key: string]: [
      {
        webhookId: string
        roleIds: string[]
        roleUpdateIds: string[]
        type: string
        pattern?: string
        value?: string
        name?: string
        description?: string
        commandFieldType?: string
        commandFieldDescription?: string
        commandFieldRequired?: boolean
        caseSensitive?: boolean
        botMention?: boolean
        placeholder?: string
        presence?: string
        nick?: string
        interactionMessageId?: string
      },
    ]
  }
  logs: string[]
  autoLogs: boolean
  autoLogsChannelId: string
  placeholderMatching: {
    [key: string]: string
  }
  placeholderWaiting: {
    [key: string]: boolean
  }
  executionMatching: {
    [key: string]: any
  }
  promptData: {
    [key: string]: any
  }
  nodeInstances: Record<string, { active: boolean }> // Stocăm NodeId

  registerNode(nodeId: string): void
  unregisterNode(nodeId: string): void
  isNodeActive(nodeId: string): boolean
} = {
  ready: false,
  login: false,
  testMode: false,
  clientId: '',
  token: '',
  baseUrl: '',
  triggers: {},
  channels: {},
  logs: [],
  autoLogs: false,
  autoLogsChannelId: '',
  placeholderMatching: {},
  placeholderWaiting: {},
  executionMatching: {},
  promptData: {},
  nodeInstances: {},
  registerNode(nodeId: string) {
    if (!this.nodeInstances[nodeId]) {
      this.nodeInstances[nodeId] = { active: true }
    }
  },

  unregisterNode(nodeId: string) {
    if (this.nodeInstances[nodeId]) {
      delete this.nodeInstances[nodeId]
    }
  },

  isNodeActive(nodeId: string): boolean {
    return !!this.nodeInstances[nodeId]
  },
}

export default state
