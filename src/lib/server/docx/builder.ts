import { DocxBuilderClient, resolveProps, type AwaitableProps } from "$lib/docx/builder"
import { type PatchDocumentOptions, patchDocument } from "docx"
import AdmZip from "adm-zip"

export class DocxBuilderServer extends DocxBuilderClient {
    public async patchDocument(
        options: AwaitableProps<PatchDocumentOptions>
    ): Promise<ReturnType<typeof patchDocument>> {
        const resolved = await resolveProps(options)
        return patchDocument(resolved)
    }
}
