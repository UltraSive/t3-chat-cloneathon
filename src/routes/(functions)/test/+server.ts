import type { RequestHandler } from '@sveltejs/kit';
import { OPENROUTER_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://chat.ultrasive.com',
			'X-Title': 'My App Chat Save',
		},
		body: JSON.stringify({
			...body,
			stream: true
		})
	});

	if (!response.body) {
		return new Response('No response body', { status: 500 });
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });

		let lineEnd;
		while ((lineEnd = buffer.indexOf('\n')) !== -1) {
			const line = buffer.slice(0, lineEnd).trim();
			buffer = buffer.slice(lineEnd + 1);

			if (line.startsWith('data: ')) {
				const data = line.slice(6);
				if (data === '[DONE]') continue;

				try {
					const message = JSON.parse(data);
          console.log(message.choices?.[0]?.delta?.content);
					
					// 👉 Insert message into your DB here
					/*await locals.db.message.create({
						data: {
							content: message.choices?.[0]?.delta?.content || '',
							// add other fields as needed
						}
					});*/
				} catch (e) {
					console.error('Parse/store error:', e);
				}
			}
		}
	}

	return new Response(JSON.stringify({ success: true }));
};