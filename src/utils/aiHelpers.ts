const OPENAI_API_KEY = "sk-6fxih0xp5IOxgF6xfIlzrA";

export async function generateImageDescription(image: string): Promise<string> {
    const response = await fetch('https://api.litviva.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'hackathon/vlm',
            messages: [
                {
                    role: 'system',
                    content: `
Please describe the following image in detail. Include objects, colors, actions, and any other relevant details.
If the image is a recognizable meme, please mention the meme format.
Describe where there's space to add text or other elements in the image.    
If there are any text elements in the image, please include them in your description.`,
                },
                {
                    role: 'user',
                    content: [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image,
                            }
                        }
                    ],
                },
            ],
        })
    });

    if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    const message = data.choices[0]?.message.content;
    return message || "No description available.";
}

export async function generateImage(prompt: string): Promise<string> {
    const response = await fetch('https://api.litviva.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        mode: "cors",
        credentials: 'include',
        body: JSON.stringify({
            model: "hackathon/text2image",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "low",
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    return data.data[0].b64_json;
}

