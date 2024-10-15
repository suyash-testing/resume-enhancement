import { NextResponse } from "next/server";
import { PdfReader } from "pdfreader";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export const POST = async (req, res) => {
  const token = headers().get("Authorization");

  if (!token) {
    return NextResponse.json({ error: "Please login" }, { status: 401 });
  }

  const newToken  = token.split(" ")?.[1]
  let decodedToken;
  try {
    decodedToken = jwt.verify(newToken, process.env.JWT_SECRET);
    console.log(decodedToken,'dddd')
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }

  const { email, password } = decodedToken;

  if (email !== process.env.EMAIL || password !== process.env.PASSWORD) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid email or password" },
      { status: 401 }
    );
  }
  try {
    const data = await req.formData();
    const file = data.get("file");
    const jobDescription = data.get("jd");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert Blob to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Create an instance of PdfReader and wrap in a Promise to handle asynchronously
    const extractedText = await new Promise((resolve, reject) => {
      let text = "";
      const pdfReader = new PdfReader();

      // Use `PdfReader` to parse the buffer
      pdfReader.parseBuffer(fileBuffer, (err, item) => {
        if (err) {
          console.error("Error in PDF reader:", err);
          return reject(err);
        }

        if (!item) {
          // End of file
          return resolve(text);
        }

        if (item.text) {
          // Concatenate the extracted text
          text += item.text + " ";
        }
      });
    });

    const result = await getStructureData(jobDescription, extractedText);

    // Return the extracted text as a JSON response
    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Error processing PDF" },
      { status: 500 }
    );
  }
};

const getStructureData = async (jobDescription, extractedText) => {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      temperature: 0,
    });

    const promptTemplate = PromptTemplate.fromTemplate(
      `Please analyze the following resume in the context of the job description provided.Strictly check every single line in job description and analyze my resume whether there is a match exactly. Strictly maintain high ATS standards and give scores only to the correct ones. Focus on hard skills which are missing and also soft skills which are missing. Provide the following details.:

        1. **Analyze the candidate's resume** provided in the "extractedText" section.
        2. **Compare** it against the **jobDescription** provided in the "jobDescription" section.
        3. **Determine the match percentage** between the resume and job description based on skills, experience, and qualifications.
        4. **Identify missing accurate keywords** from the resume that are present in the job description.   
        5. **Provide a concise summary** of the candidate's qualifications.
        6. **Assess the candidate's experience level** relative to the job requirements.
       **Output Format:**

       

    **Instructions:**

    - Be **objective** and **unbiased** in your analysis.
    - Ensure the **percentage match** is a realistic assessment based on the comparison.
    - List **missing keywords** that are relevant and significant.
    - Keep the **candidate summary** concise (2-3 sentences).
    - The **experience assessment** should comment on how well the candidate's experience aligns with the job requirements.

    **extractedText:**

    {extractedText}

    **jobDescription:**

    {jobDescription}

    Provide your analysis  as per the following schema:
        {{
        "name":"Name of candidate"
        "jobDescriptionMatch": "Percentage match as a number followed by %",
        "missingKeywords": ["List", "of", "missing", "keywords"],
        "candidateSummary": "Brief summary of the candidate's qualifications",
        "experienceAssessment": "Assessment of the candidate's experience level",
        "matchingKeyword" :["List","of","matchings","keywords"]
    }}
    `
    );

    const chain = RunnableSequence.from([
      promptTemplate,
      llm,
      new JsonOutputParser(),
    ]);
    // const chain = promptTemplate.pipe(llm).pipe(new JsonOutputParser());

    const response = await chain.invoke({
      jobDescription: jobDescription,
      extractedText: extractedText,
    });
    return response;
  } catch (error) {
    console.log("error form llm model", error);
  }
};
