import { logger } from "$lib/server/logging";
import { json } from '@sveltejs/kit';
import { Document, Packer } from 'docx';
import { DocxBuilderServer as DocxBuilder } from "$lib/server/docx/builder";

async function arbitraryAwaitable(output: string): Promise<string> {
    return output
}

async function generateSummaryDoc(): Promise<Document> {

    const builder = new DocxBuilder()
    const doc = await builder.document({
        sections: [
            builder.section({
                children: [
                    builder.Paragraph({ text: 'Dear miss ...' }),
                    builder.Paragraph(
                        arbitraryAwaitable('We appreciate your time and patience during [NAME]’s participation at the Healthy Brain Network. This letter is a summary of the results of the assessments. The results are based on the information you provided, the information [NAME] provided, and the results of the assessments. For more detailed information, please refer to the clinical report.')
                    ),
                    builder.Paragraph({
                        children: [
                            builder.TextRun({
                                text: 'Report generated on: ' + new Date().toISOString(),
                            }),
                        ],
                    }),
                ],
            }),
        ],
    })
    console.log("Document created:", !!doc);
    return doc
}

export async function GET() {
    try {
        const doc = await generateSummaryDoc();
        const buffer = await Packer.toBuffer(doc);
        
        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename="summary-report.docx"',
                'Content-Length': buffer.length.toString()
            }
        });
    } catch (error) {
        logger.error('Error generating Word document:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ error: 'Failed to generate document', details: errorMessage }, { status: 500 });
    }
}