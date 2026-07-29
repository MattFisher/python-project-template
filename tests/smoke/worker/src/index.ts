export default {
  async fetch(request: Request, _env: Cloudflare.Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // The deploy pipeline smoke-tests this endpoint after every deploy — keep
    // it cheap and dependency-free.
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok" });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Cloudflare.Env>;
