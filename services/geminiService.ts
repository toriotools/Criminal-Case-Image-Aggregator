import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiImageResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    images: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: "A detailed, journalistic-style description of an image, suitable for prompting an AI image generator to create a photorealistic result."
          },
          imageType: {
            type: Type.STRING,
            description: "A short category like 'mugshot', 'courtroom', 'arrest', 'evidence', 'location', 'headline'."
          },
          source: {
            type: Type.STRING,
            description: "A plausible source, e.g., 'Associated Press', 'FBI Archives'."
          },
          year: {
            type: Type.INTEGER,
            description: "A plausible year for the image."
          },
          generatedFilename: {
            type: Type.STRING,
            description: "A filename in the format: [name_in_snake_case]_[imageType]_[source_in_snake_case]_[year].jpg"
          },
          sourceUrl: {
            type: Type.STRING,
            description: "A plausible-looking but fake source URL."
          },
        },
        required: ["description", "imageType", "source", "year", "generatedFilename", "sourceUrl"]
      },
    },
  },
  required: ["images"]
};


export const fetchImageData = async (
  criminalName: string,
  language: string,
  imageCount: number
): Promise<{ images: GeminiImageResponse[] }> => {
  // Sanitize the input to prevent issues with special characters in the prompt
  const sanitizedName = criminalName.replace(/["`]/g, '\const sanitizedName = criminalName.replace(/[`"]/g, '\$&');');

  const langMap = {
      en: "English",
      pt: "Portuguese",
      es: "Spanish"
  };

  const prompt = `
    You are an expert criminal archivist. Your task is to generate metadata for plausible images related to a criminal case.

    **Input Name:** "${sanitizedName}"
    **Language for descriptions:** ${langMap[language] || 'English'}
    **Number of images to find:** ${imageCount}

    **Instructions:**
    1.  **Generate Diverse & Relevant Image Scenarios:** Create descriptions for a variety of images related to the case. Include: mugshots, courtroom sketches/photos, arrest photos, evidence, relevant locations, and newspaper headlines.
    2.  **Strictly AVOID:** Graphic content, images of victims, memes, or sensationalism.
    3.  **Create Detailed Metadata:**
        *   'description': A concise, journalistic-style description. CRITICAL: This description must be detailed enough to be a prompt for an AI image generator to create a photorealistic image. E.g., instead of 'man in court', write 'Black and white photograph of a man in a 1940s suit sitting at a defendant's table in a wood-paneled courtroom, looking somber'.
    4.  **VERY IMPORTANT for Image Generation Safety:** In the 'description' field, DO NOT use the specific name "${sanitizedName}". Instead, refer to the person with generic but descriptive terms like 'the defendant', 'a woman with blonde hair', 'the suspect'. This is crucial to prevent the image generation from being blocked.
    5.  **Generate a Filename:** Format: '[name_in_snake_case]_[imageType]_[source_in_snake_case]_[year].jpg'.
    6.  **Generate a Source URL:** Create a plausible-looking but fake source URL.

    **Output Format:**
    Return a valid JSON object with a single key "images". Do not include any text outside the JSON.
    `;

  try {
    // Step 1: Generate image descriptions and metadata
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = textResponse.text.trim();
    const parsedDescriptions = JSON.parse(jsonText);
    
    if (!parsedDescriptions || !Array.isArray(parsedDescriptions.images)) {
        throw new Error("Invalid JSON structure received from text generation API.");
    }

    // Step 2: Generate images sequentially to avoid rate limiting
    const successfulImages: GeminiImageResponse[] = [];
    for (const imageInfo of parsedDescriptions.images) {
        try {
            const imageGenResponse = await ai.models.generateImages({
              model: 'imagen-4.0-generate-001',
              prompt: `${imageInfo.description}, photorealistic, documentary style`,
              config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
              },
            });

            // Defensive check for a valid response structure
            if (
                imageGenResponse &&
                imageGenResponse.generatedImages &&
                imageGenResponse.generatedImages.length > 0 &&
                imageGenResponse.generatedImages[0].image &&
                imageGenResponse.generatedImages[0].image.imageBytes
            ) {
                const base64ImageBytes: string = imageGenResponse.generatedImages[0].image.imageBytes;
                successfulImages.push({
                    ...imageInfo,
                    base64Image: base64ImageBytes,
                });
            } else {
                console.error(`Received an invalid or empty response for image generation with description: "${imageInfo.description}"`, "Full response:", imageGenResponse);
            }
        } catch (genError) {
            console.error(`Failed to generate image for description: "${imageInfo.description}"`, genError);
            // Continue to the next image instead of failing the whole batch
        }
    }

    return { images: successfulImages };
    
  } catch (error) {
    console.error(`Error fetching image data for "${sanitizedName}":`, error);
    throw new Error(`Failed to get a valid response for "${sanitizedName}".`);
  }
};