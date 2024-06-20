/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// const artfy_origin = "*" // "https://artfyyou.com"
const artfy_origin = "https://artfyyou.com"

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get("Origin");
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": origin || artfy_origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400", // One day
        };

        // Handle OPTIONS preflight request
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        let response;
        switch (path) {
            case "/upload":
                if (request.method === "POST") {
                    response = await handleUpload(request, env, ctx);
                } else {
                    // Handle non-POST requests to "/upload" differently if needed
                    response = new Response("Method not allowed for /upload", { status: 405 });
                }
                break;

            // Add more cases for different paths as needed
            default:
                response = new Response("Not found", { status: 404 });
        }

        // Apply CORS headers to actual request responses
        response.headers.set("Access-Control-Allow-Origin", corsHeaders["Access-Control-Allow-Origin"]);
        response.headers.set("Access-Control-Allow-Methods", corsHeaders["Access-Control-Allow-Methods"]);
        response.headers.set("Access-Control-Allow-Headers", corsHeaders["Access-Control-Allow-Headers"]);
        response.headers.set("Access-Control-Max-Age", corsHeaders["Access-Control-Max-Age"]);

        return response;
    },
};

async function handleUpload(request, env, ctx) {
    const formData = await request.formData();
    const email = formData.get("email");
    const art_styles = formData.get("art_styles");
    const portrait = formData.get("portrait"); // This is a File object
    const lang_code = formData.get("lang_code");
    const upload_langcode = formData.get("upload_langcode");

    await pushover("Success, upload", " - " + email + "\n - " + art_styles + "\n - " + portrait.name, env);

    // Validate the input (basic example, expand according to your needs)
    if (!email || !portrait || !art_styles) {
        return new Response("Missing required fields", { status: 400 });
    }

    // Extract the file extension from the portrait's name
    const fileName = portrait.name;
    const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

    // Convert the image file to a blob for storage
    const portraitBlob = await portrait.arrayBuffer();

    // Generate a unique key for the portrait based on the email and a timestamp
    const timestamp = new Date().toISOString();
    const key = `${timestamp}-${email}`;

    try {
        // Store the portrait with metadata in the KV store
        await env.API_SERVER.put(key, portraitBlob, { metadata: { email, art_styles, fileExtension, lang_code, upload_langcode } });

        return new Response(JSON.stringify({ message: "Data stored successfully", key }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                // Apply CORS headers to success response
                "Access-Control-Allow-Origin": artfy_origin, // Adjust as needed
            }
        });
    } catch (error) {
        await pushover("Error, upload", error.toString(), env);
        // Handle any errors during KV put operation
        return new Response("Error storing data: " + error.toString(), { status: 500 });
    }
}

async function pushover(topic, message, env) {
    try {
        const response = await fetch('https://api.pushover.net/1/messages.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                title: topic,
                token: env.pushover_app_apitoken,
                user: env.pushover_userkey,
                message: message,
            })
        })
    } catch (error) {
        // console.error(error);
    }
}