import { NextResponse } from "next/server";
import { PdfReader } from "pdfreader";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { generateDocx as generateTemplate1 } from "@/templates/template1";
import { generateDocx as generateTemplate2 } from "@/templates/template2";
import { ChatOpenAI } from "@langchain/openai";

export const POST = async (req, res) => {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const templateOptions = data.get("templateOption");
    const model = data.get("modelOption");

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

    const result = await getStructureData(extractedText, model);

    let docBuffer;

    if (templateOptions == "1") {
      docBuffer = await generateTemplate1(result);
    } else {
      docBuffer = await generateTemplate2(result);
    }

    const base64Doc = docBuffer.toString("base64");
    // Return the extracted text as a JSON response
    return NextResponse.json({
      data: result,
      file: base64Doc, // Base64 encoded document file
      fileName: `${result?.name}_resume.docx`,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Error processing PDF" },
      { status: 500 }
    );
  }
};

const getStructureData = async (extractedText, model) => {
  try {
    let llm;
    if (model === "chatgpt") {
      llm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      llm = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        temperature: 0,
      });
    }

    const promptTemplate = PromptTemplate.fromTemplate(
      `You are an expert administrator responsible for extracting structured data from documents.
    The content provided below contains the information you need to process:
    
    {extractedText}
    
    Based on this content, extract and structure only the following specific data points in a valid JSON format:
    
    {{
      "name": "name",
      "professionalSummary": [
        "Professional summary or organization experience"
      ],
      "technicalSkills": {{
        //...
      }},
      "workExperience": [
        {{
          "Organization": "Organization Name",
          "Client": "Client Name",
          "role": "Job Role",
          "duration": "Start Date - End Date",
          "responsibilities": [
            "Roles and Responsibilities"
          ]
        }}
      ],
      "projects": [
        {{
          "project": "Project Name",
          "Client": "Client Name",
          "role": "Role in Project",
          "duration": "Duration in Months",
          "description": "Project Description",
          "toolsUsed": ["Tool1", "Tool2"],
          "responsibilities": [
            "Roles and Responsibilities in Project"
          ]
        }}
      ],
      "education": [
        {{
          "degree": "Degree Name",
          "institution": "Institution Name",
          "location": "Location",
          "year": "Graduation Year"
        }}
      ],
      "certifications": [
        {{
          "name": "Certification Name",
          "issuer": "Issuing Authority",
          "date": ""
        }}
      ]
    }}
    
    Instructions:
          
    - **If any sentence in the professional summary  is short (less than 10 words), expand it by adding more details to make it more descriptive and professional.**
    -If the professional summary is short (fewer than 5 bullet points), expand it by adding more bullet points based on the resume's experience and skills.
        - **Do not modify, shorten, or delete a detailed professional summary that has 5 or more bullet points.**
        - Categorize technical skills inside an object where keys are the categories and values are arrays of skills.
        -For the Work Experience section:
          - Ensure that each entry includes "Organization", "Client", "Role", "Duration", and "Responsibilities".
          **If any responsibility bullet point is short (less than 10 words), expand it to provide more detail and make it more professional.**
          - "Responsibilities" should be a list of bullet points accurately reflecting the candidate's duties and achievements.
        - For the Projects section:
          - Ensure that each entry includes "Project", "Client", "Role", "Duration", "Description", "Features", "Tools Used", and "Responsibilities".
          - If project features are mentioned, include them in the project description with all details and do not add users work and responsibilities in description.
          **If any responsibility bullet point is short (less than 10 words), expand it to provide more detail and make it more professional.**
            - "Responsibilities" should be a list of bullet points accurately reflecting the candidate's duties and achievements.
          - "Tools Used"  should be a list of technologies and tools used in the project.
        - Ensure the extracted information is well-structured and formatted as a valid JSON array.
        - Enclose all keys and string values in double quotes.
        - Validate that the JSON adheres to standard syntax.
        - Double-check the structure against the required data points for accuracy, including ensuring correct spelling and grammar.
        - Return only the JSON array without additional text or commentary.
    `
    );
    const chain = promptTemplate.pipe(llm).pipe(new JsonOutputParser());
    const response = await chain.invoke({
      extractedText: extractedText,
    });
    return response;
  } catch (error) {
    console.log("error form llm model", error);
  }
};
