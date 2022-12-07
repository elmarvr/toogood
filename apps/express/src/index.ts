import express from "express";
import routes from "@toogood/auth/src/routes";

const app = express();

app.use(express.json());

const defaultOptions = {
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

app.get("/auth/:providerId/signin", async (req, res) => {
  const { providerId } = req.params;

  const { redirect } = await routes.signin({
    options: {
      ...defaultOptions,
      providerId,
    },
  });

  res.redirect(redirect);
});

app.get("/auth/:providerId/callback", async (req, res) => {
  const { providerId } = req.params;

  const { redirect } = await routes.callback({
    options: {
      ...defaultOptions,
      providerId,
    },
    query: req.query,
    body: req.body,
  });

  res.redirect(redirect);
});

app.post("/auth/session", async (req, res) => {
  const { json } = await routes.session({
    options: defaultOptions,
    body: req.body,
  });

  res.json(json);
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
