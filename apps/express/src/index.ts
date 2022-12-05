import fastify from "fastify";

const app = fastify();

app.get("/", async (request, reply) => {
  return reply.send({ hello: "world" });
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  console.log(`server listening on ${address}`);
})