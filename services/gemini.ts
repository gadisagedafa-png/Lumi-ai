
import { GoogleGenAI, Type } from "@google/genai";
import { Document, Quiz, Note, FlashcardSet } from '../types';
// @ts-ignore
import mammoth from 'mammoth';
// @ts-ignore
import JSZip from 'jszip';

// Helper to get fresh API client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Ensure process.env.API_KEY is set.");
    throw new Error("API Key not found. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert Blob/File to Base64 (for standard supported formats)
const fileToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper to extract text from DOCX using mammoth
const extractDocxText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return "Error extracting text from DOCX file.";
  }
};

// Helper to extract text from PPTX using JSZip (basic slide text extraction)
const extractPptxText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    let textContent = "";
    
    // Find all slide XML files
    const slideFiles = Object.keys(zip.files).filter(fileName => 
      fileName.startsWith("ppt/slides/slide") && fileName.endsWith(".xml")
    );
    
    // Sort logically (slide1, slide2, etc.)
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.match(/\d+/)?.[0] || "0");
      return numA - numB;
    });

    for (const fileName of slideFiles) {
      const xmlString = await zip.files[fileName].async("string");
      // Simple regex to extract text within <a:t> tags
      const slideText = xmlString.match(/<a:t>([^<]*)<\/a:t>/g)
        ?.map((tag: string) => tag.replace(/<\/?a:t>/g, ""))
        .join(" ") || "";
        
      if (slideText.trim()) {
        textContent += `[SLIDE]: ${slideText}\n\n`;
      }
    }
    
    return textContent || "No text found in presentation slides.";
  } catch (error) {
    console.error("PPTX extraction error:", error);
    return "Error extracting text from PPTX file.";
  }
};

// Helper to prepare file part
const getFilePart = async (doc: Document) => {
  const mimeType = doc.mimeType.toLowerCase();
  const name = doc.title.toLowerCase();

  // Handle DOCX -> Extract Text -> Send as plain text
  if (mimeType.includes('wordprocessingml') || name.endsWith('.docx')) {
    const text = await extractDocxText(doc.file);
    return {
      inlineData: {
        mimeType: 'text/plain',
        data: btoa(unescape(encodeURIComponent(text))) // text to base64 safely
      }
    };
  }

  // Handle PPTX -> Extract Text -> Send as plain text
  if (mimeType.includes('presentationml') || name.endsWith('.pptx')) {
    const text = await extractPptxText(doc.file);
    return {
      inlineData: {
        mimeType: 'text/plain',
        data: btoa(unescape(encodeURIComponent(text)))
      }
    };
  }

  // Handle Standard Text Formats supported by Gemini but sometimes easier as plain text
  // Actually Gemini supports these mimetypes usually, but text/plain is safest for inline data if simple.
  // However, PDF and Images MUST go as their native type.
  const isImageOrPdf = mimeType.includes('pdf') || mimeType.includes('image');
  
  if (isImageOrPdf) {
     const base64Data = await fileToBase64(doc.file);
     return {
       inlineData: {
         mimeType: doc.mimeType,
         data: base64Data
       }
     };
  }
  
  // For other text formats (txt, csv, json, md, html, xml, js, py)
  // We read as text and send as text/plain or specific type if widely supported.
  // Using simple text read is safer for generic 'text/*' types to ensure encoding is correct in base64.
  const text = await doc.file.text();
  return {
    inlineData: {
      mimeType: 'text/plain', // Simplifies processing for the model
      data: btoa(unescape(encodeURIComponent(text)))
    }
  };
};

// --- ERROR HANDLING & RETRY LOGIC ---

const getFriendlyErrorMessage = (error: any, defaultMsg: string): string => {
  const msg = error?.message || '';
  const status = error?.status;
  
  // 429 RESOURCE_EXHAUSTED
  if (msg.includes('429') || status === 429 || status === 'RESOURCE_EXHAUSTED' || msg.includes('quota')) {
    return "You've reached the AI usage limit for now. Please wait a minute and try again! ⏳";
  }
  
  // 401 UNAUTHENTICATED
  if (msg.includes('401') || status === 401) {
    return "Invalid API Key. Please check your settings.";
  }
  
  // 503 SERVICE_UNAVAILABLE
  if (msg.includes('503') || status === 503 || msg.includes('overloaded')) {
    return "Lumi is a bit overloaded right now. Please try again in a few seconds.";
  }
  
  return defaultMsg;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || '';
      const status = error?.status;
      
      const isQuotaError = msg.includes('429') || status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isServerError = msg.includes('503') || status === 503 || msg.includes('overloaded');
      
      // If it's a transient error or quota limit, we wait and retry
      if ((isQuotaError || isServerError) && i < retries - 1) {
        const waitTime = baseDelay * Math.pow(2, i); // Exponential backoff: 2s, 4s, 8s
        console.warn(`Gemini API Error (${status || 'Quota/Server'}). Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(waitTime);
        continue;
      }
      
      // If we are out of retries or it's a non-retryable error, throw immediately
      throw error;
    }
  }
  throw lastError;
}

// --- API FUNCTIONS ---

export const generateChatResponse = async (
  doc: Document,
  history: { role: string; text: string }[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const filePart = await getFilePart(doc);

    // We use flash for chat for lower latency
    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      You are 'Lumi', a cute and intelligent study assistant.
      Your task is to answer questions based ONLY on the provided document.
      - Explain concepts clearly and simply.
      - Expand ideas instead of summarizing them.
      - Use examples where helpful.
      - NEVER hallucinate or use outside knowledge.
      - If the answer is not found in the document, respond exactly with: "I couldn’t find this in your notes."
    `;

    const contents = [
      { role: 'user', parts: [filePart, { text: "Analyze this document for our session." }] },
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    return await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model,
        contents: contents, 
        config: {
          systemInstruction,
          temperature: 0.4,
        }
      });
      return response.text || "I couldn't generate a response.";
    }, 2, 1000); // Fewer retries for chat to keep it responsive

  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return `⚠️ ${getFriendlyErrorMessage(error, "I'm having trouble thinking right now. Try again?")}`;
  }
};

export const generateStudyNotes = async (doc: Document): Promise<Note> => {
  try {
    const ai = getAiClient();
    const filePart = await getFilePart(doc);
    
    const prompt = `
      Act as an expert academic note-taker.
      Your task is to create a **Comprehensive Master Study Guide** based STRICTLY on the provided document.
      
      **CRITICAL INSTRUCTION:**
      1. **Identify Structure:** First, scan the document to identify ALL distinct units, chapters, or main sections.
      2. **Deep Content Extraction:** For EACH unit/chapter, generate comprehensive, deep study notes. Do not summarize; rewrite the content in full detail to capture all nuances.
      3. **Strict Source Fidelity:** Use ONLY the information provided in the document. Do not add outside info.
      4. **Original Flow:** Maintain the exact chronological order of topics and concepts as they appear in the document. Use the document's original wording where appropriate to ensure accuracy.
      5. **Direct Formatting:** **DO NOT** use generic labels like "Explanation:", "Details:", "Breakdown:", or "Examples:". Instead, strictly use the **actual headings, sub-headings, and topics** found in the document as your structure.

      **REQUIRED OUTPUT STRUCTURE (Markdown):**

      # ❀ [Document Title]

      ---
      
      ## [Unit/Chapter Number]: [Unit/Chapter Title]

      ### [Sub-topic / Section Heading]
      (Write full, detailed paragraphs explaining this topic based on the text. Cover every point mentioned in this section of the document.)

      (If the document lists items, steps, or features, use bullet points:)
      * [List item from text]
      * [List item from text]

      ### [Next Sub-topic / Section Heading]
      (Content...)

      (Repeat for all sections in this Unit/Chapter)

      ---
      (Repeat for ALL Units/Chapters found in the document)
      
      ## ✎ Vital Terminology
      (List key terms found in the text)
      > ❞ **[Term]**: [Definition from text]
    `;

    // Strategy: Try the Pro model first. If it fails due to quota, fallback to Flash.
    const generateWithModel = async (modelName: string) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [filePart, { text: prompt }]
        },
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      });
      if (!response.text) throw new Error("Empty response from AI");
      return response.text;
    };

    let generatedText = "";
    
    try {
      // Attempt 1: Gemini Pro (Best Quality)
      generatedText = await retryOperation(() => generateWithModel("gemini-3-pro-preview"), 2, 2000);
    } catch (err: any) {
      const msg = err?.message || '';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      
      if (isQuota) {
        console.warn("Gemini Pro quota exhausted. Fallback to Gemini Flash for notes.");
        // Attempt 2: Gemini Flash (High Speed/Efficiency) - better than failing
        generatedText = await retryOperation(() => generateWithModel("gemini-3-flash-preview"), 3, 2000);
      } else {
        throw err; // Re-throw if it's not a quota issue or we shouldn't fallback
      }
    }

    return {
      id: crypto.randomUUID(),
      documentId: doc.id,
      title: `❀ Notes: ${doc.title}`,
      content: generatedText,
      createdAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Gemini Notes Error:", error);
    throw new Error(getFriendlyErrorMessage(error, "Failed to generate notes."));
  }
};

export const generateQuiz = async (doc: Document, difficulty: 'easy' | 'medium' | 'hard'): Promise<Quiz> => {
  try {
    const ai = getAiClient();
    const filePart = await getFilePart(doc);
    const model = "gemini-3-flash-preview";

    const prompt = `
      Generate a quiz with 5 multiple choice questions based on the document.
      Difficulty: ${difficulty}.
      Return the output in strictly valid JSON format matching this schema:
      {
        "questions": [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctAnswerIndex": number (0-3),
            "explanation": "string"
          }
        ]
      }
    `;

    const generatedQuiz = await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [filePart, { text: prompt }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswerIndex", "explanation"]
                }
              }
            }
          }
        }
      });

      const jsonText = response.text || "{}";
      return JSON.parse(jsonText);
    }, 3, 2000);

    return {
      id: crypto.randomUUID(),
      documentId: doc.id,
      title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz: ${doc.title}`,
      questions: generatedQuiz.questions?.map((q: any) => ({...q, id: crypto.randomUUID()})) || [],
      createdAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    throw new Error(getFriendlyErrorMessage(error, "Failed to generate quiz."));
  }
};

export const generateFlashcards = async (doc: Document): Promise<FlashcardSet> => {
  try {
    const ai = getAiClient();
    const filePart = await getFilePart(doc);
    const model = "gemini-3-flash-preview";

    const prompt = `
      Create a set of 15 key term/concept flashcards from this document.
      Focus on the most important definitions, dates, or concepts.
      Keep the 'front' (term/question) concise.
      Keep the 'back' (definition/answer) clear and simple.
      Return strictly valid JSON.
    `;

    const generatedSet = await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [filePart, { text: prompt }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING, description: "The term, question, or concept" },
                    back: { type: Type.STRING, description: "The definition, answer, or explanation" }
                  },
                  required: ["front", "back"]
                }
              }
            }
          }
        }
      });

      const jsonText = response.text || "{}";
      return JSON.parse(jsonText);
    }, 3, 2000);

    return {
      id: crypto.randomUUID(),
      documentId: doc.id,
      title: `Flashcards: ${doc.title.length > 20 ? doc.title.substring(0, 20) + '...' : doc.title}`,
      cards: generatedSet.cards?.map((c: any) => ({...c, id: crypto.randomUUID()})) || [],
      createdAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Gemini Flashcard Error:", error);
    throw new Error(getFriendlyErrorMessage(error, "Failed to generate flashcards."));
  }
};
