Deno.serve(() => {
  return new Response(JSON.stringify({ service: "cruz-agenda", status: "ok" }), {
    headers: { "content-type": "application/json" },
  });
});
