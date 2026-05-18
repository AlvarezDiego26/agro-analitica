import { bootstrap } from "./bootstrap.js";

const { app, env } = bootstrap();

app.listen(env.port, () => {
  console.log(`AgroAnalitica API listening on http://localhost:${env.port}`);
});
