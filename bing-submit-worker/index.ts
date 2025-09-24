export interface Env {
  BING_API_KEY: string;
  SITE_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Expected POST request', { status: 405 });
    }

    const { files } = await request.json<{ files: string[] }>();

    if (!files || !Array.isArray(files)) {
      return new Response('Missing "files" in request body', { status: 400 });
    }

    const siteUrl = env.SITE_URL;
    const urls = files.map(file => `${siteUrl}/posts/${file.replace(/\.md$/, '')}/`);

    try {
      const response = await fetch(
        `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${env.BING_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            siteUrl,
            urlList: urls,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        console.log('Successfully submitted URLs to Bing:', responseData);
        return new Response(
          JSON.stringify({ success: true, submittedUrls: urls, bingResponse: responseData }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('Error submitting URLs to Bing:', responseData);
        return new Response(JSON.stringify({ success: false, error: responseData }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Failed to submit URLs to Bing:', error);
      return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};