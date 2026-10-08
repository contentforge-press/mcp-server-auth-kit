// MCP Server Auth Kit — API Key 认证模板（KV 密钥校验）
// 密钥存 KV: AUTH_KEYS = "key1,key2,..."；客户端带 Authorization: Bearer <key>
export default {
  async fetch(request) {
    const auth = request.headers.get("Authorization") || "";
    const key = auth.replace(/^Bearer /i, "");
    const keys = (await MCP_AUTH.get("AUTH_KEYS", "text") || "").split(",").map(s => s.trim());
    if (!key || !keys.includes(key)) return json({ error: { code: -32001, message: "Unauthorized: valid API key required" } }, 401);
    const body = await request.json().catch(() => ({}));
    if (body.method === "initialize") return json({ protocolVersion: "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "mcp-auth-kit", version: "1.0.0" } });
    if (body.method === "tools/list") return json({ tools: [
      { name: "secure_hello", description: "Authenticated hello: returns caller identity", inputSchema: { type: "object", properties: { name: { type: "string" } } } }
    ]});
    if (body.method === "tools/call") {
      if (body.params?.name !== "secure_hello") return json({ error: { code: -32601, message: "Tool not found" } });
      return json({ content: [{ type: "text", text: "Authenticated OK. Key: " + key.slice(0, 8) + "..." }] });
    }
    return json({ error: { code: -32601, message: "Method not found" } });
  }
};
function json(o, s){ return new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json" }, status: s || 200 }); }
