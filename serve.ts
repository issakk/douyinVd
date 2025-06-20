import { getVideoUrl, getVideoInfo } from "./douyin.ts";

export const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const { pathname, searchParams } = url;

    // API 逻辑：如果请求包含 'url' 参数
    if (searchParams.has("url")) {
        const rawInput = searchParams.get("url")!;
        console.log("Raw Input:", rawInput);

        // --- 新增代码：使用正则表达式从输入文本中提取URL ---
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = rawInput.match(urlRegex);

        // 如果没有匹配到URL，返回错误信息
        if (!match) {
            const errorResponse = {
                error: "未在输入中找到有效的URL。",
                message: "请确保分享内容中包含 'http://' 或 'https://' 开头的链接。",
            };
            return new Response(JSON.stringify(errorResponse), {
                status: 400, // 400 Bad Request 表示客户端请求错误
                headers: { "Content-Type": "application/json; charset=utf-8" },
            });
        }

        const inputUrl = match[0]; // 提取到的URL
        console.log("Extracted URL:", inputUrl);
        // --- 代码修改结束 ---

        try {
            // 如果有 'data' 参数，则返回详细的 JSON 信息
            if (searchParams.has("data")) {
                const videoInfo = await getVideoInfo(inputUrl);
                return new Response(JSON.stringify(videoInfo), {
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                });
            }

            // 否则，只返回视频的直接链接
            const videoUrl = await getVideoUrl(inputUrl);
            return new Response(videoUrl);

        } catch (e) {
            // 捕获和处理在获取视频信息过程中可能发生的错误
            const errorResponse = {
                error: "获取视频信息失败。",
                message: e.message,
            };
            return new Response(JSON.stringify(errorResponse), {
                status: 500,
                headers: { "Content-Type": "application/json; charset=utf-8" },
            });
        }
    }

    // 主页逻辑：如果访问根路径 '/'
    if (pathname === "/") {
        try {
            // 读取并返回 index.html 文件内容
            const html = await Deno.readTextFile("./index.html");
            return new Response(html, {
                headers: { "Content-Type": "text/html; charset=utf-8" },
            });
        } catch (error) {
            // 如果 index.html 文件不存在
            return new Response("Homepage not found.", { status: 404 });
        }
    }

    // 如果路径不匹配，返回 404
    return new Response("Not Found", { status: 404 });
};
