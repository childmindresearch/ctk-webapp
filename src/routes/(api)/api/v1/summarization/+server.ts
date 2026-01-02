import { logger } from "$lib/server/logging";
import { json } from '@sveltejs/kit';
import { Document, Packer } from 'docx';
import { DocxBuilderServer as DocxBuilder } from "$lib/server/docx/builder";
import { type ReportSummaryRequest } from "./index.js";

async function generateSummaryDoc(data: ReportSummaryRequest): Promise<Document> {

    const builder = new DocxBuilder()
    let name = ''
    try {
        name = data.patient_name
    } catch (e) {
        logger.error('Error extracting name from data:', e);
    }
    const doc = await builder.document({
        sections: [
            builder.section({
                children: [
                    builder.Paragraph({ text: 'Dear miss ...' }),
                    builder.Paragraph(`We appreciate your time and patience during ${name}'s participation at the Healthy Brain Network. This letter is a summary of the results of the assessments. The results are based on the information you provided, the information ${name} provided, and the results of the assessments. For more detailed information, please refer to the clinical report.`
                    ),
                    builder.Paragraph('Summary of Findings:'),
                    builder.Paragraph(data.text_content),
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


export async function POST({ request }) {
    try {
        // receive the request data if needed
        const data = await request.json();
        console.log("Request data:", data);
        const doc = await generateSummaryDoc(data);
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
