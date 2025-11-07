import { type AmazonBedrockProvider, createAmazonBedrock } from "@ai-sdk/amazon-bedrock"
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import { AWS_REGION, LLM_DEFAULT_MODEL, LLM_DEFAULT_PROVIDER } from "$env/static/private"
import { generateText, type LanguageModel } from "ai"

type LlmProvider = "aws"
type LlmClient = AmazonBedrockProvider
type GenerateTextOptions = Parameters<typeof generateText>[0]

export class Llm {
    private client: LlmClient
    private model: LanguageModel

    constructor(model: string = LLM_DEFAULT_MODEL, provider: LlmProvider = LLM_DEFAULT_PROVIDER as LlmProvider) {
        this.client = this.getClient(provider)
        this.model = this.client(model)
    }

    private getClient(provider: LlmProvider): LlmClient {
        switch (provider) {
            case "aws":
                return createAmazonBedrock({
                    region: AWS_REGION,
                    credentialProvider: fromNodeProviderChain()
                })
            default:
                throw new Error("Unknown provider")
        }
    }

    async generateText(options: Omit<GenerateTextOptions, "model">): Promise<string> {
        const response = await generateText({
            model: this.model,
            ...options
        } as GenerateTextOptions)
        return response.text
    }
}
