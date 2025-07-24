export async function generateImageDescription(image: string): Promise<string> {
    const response = await fetch('https://api.litviva.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer sk-6fxih0xp5IOxgF6xfIlzrA`
        },
        body: JSON.stringify({
            model: 'hackathon/vlm',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that describes images.'
                },
                {
                    role: 'user',
                    content: [
                        {type: "text", text: "whats in this image?"},
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

