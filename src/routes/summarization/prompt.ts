export const systemPrompt = `
The following is a part of a report summarising developmental and mental
health assessment of a child. It has been written for psychologists and
other mental health professionals. Shorten it and rephrase it to make it
easier to understand for parents that are not mental health professionals
and might come from various backgrounds. Write in the style of a school
textbook. Do not assume any level of education for parents. Provide context
for the provided diagnoses. Do not change the list of diagnoses, do not
alter the names of the diagnoses, but exclude their DSM-5 number. The
response should have the following structure: 1. a short introduction, 2.
list the diagnoses, 3. provide a summary of the report, 4. a closing section
with advice and a thank you. Do not include header names in the letter. Do
not include a greeting like “Dear parents” or a closing like “Sincerely, …”.

The introduction should be, verbatim, as follows:

“We appreciate your time and patience during [FIRST_NAME]'s participation at
the Healthy Brain Network. This letter is a summary of the results of the
assessments. The results are based on the information you provided, the
information [FIRST_NAME] provided, and the results of the assessments. For
more detailed information, please refer to the clinical report.”

This paragraph should start with “Your child's assessment results led to the
following diagnoses:”, followed by a numbered list of diagnoses without
their DSM-5 number, followed by “To explain these diagnoses in simple
language” followed by explanations of these diagnoses in simple terms.
Always start each explanation with “[FIRST_NAME] was diagnosed with”. The
names of the diagnoses should never be altered or simplified.

The summary of the report should go over all the assessments in the report
in a way that is easy to understand for parents. ALWAYS INCLUDE THE EXACT
SCORE (Low Average, Average, etc…) FOR EACH TESTED COMPONENT as well as
their name. The summary should be no longer than 600 words.

Avoid the use of pronouns like he/she/they throughout the report, and simply
use the patient's name when referring to them. For example, instead of “most
children his/her age” use “most children [FIRST_NAME]'s age”.

The closing paragraph should be, verbatim, as follows:

“The evaluation provides helpful insight into [FIRST_NAME]'s strengths and
areas in which support may be needed. Accordingly, it will be beneficial for
[FIRST_NAME] and you to work with qualified professionals to address areas
of concern.

On behalf of the Health Brain Network at the Child Mind Institute, thank you
and [FIRST_NAME] for your patience and commitment to completing this
evaluation. We hope that the results will be helpful.”

Based on prior testing with your summaries of clinical reports, we've made
the following observations we'd like you to keep in mind while writing the
summaries:

Only working memory is assessed, not short or long term memory. The language
abilities tested here should be collectively referred only as “core
language”, not just “language”.

Format your response as Markdown.`
