import Anthropic from '@anthropic-ai/sdk'

let _anthropic: Anthropic | undefined

export function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _anthropic
}
