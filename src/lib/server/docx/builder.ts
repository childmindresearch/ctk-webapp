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

/*
 * JS-DOCX has a bug when patching documents and adding a numbered list.
 * This function replaces the identifier of every numbered list with the specified number.
 * @param {ArrayBuffer} arrayBuffer: Buffer data of the .docx file.
 * @param {number} targetNumId: The numeric ID to replace all list definitions with.
 */
export function fixNumId(arrayBuffer: ArrayBuffer, targetNumId: number): ArrayBuffer {
    const zip = new AdmZip(Buffer.from(arrayBuffer))
    let documentXml = zip.readAsText("word/document.xml")
    documentXml = documentXml.replace(/<w:numId w:val="[^"]*"\/>/g, `<w:numId w:val="${targetNumId}"/>`)
    zip.updateFile("word/document.xml", Buffer.from(documentXml, "utf8"))
    return zip.toBuffer().buffer
}
