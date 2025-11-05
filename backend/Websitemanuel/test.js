var fetch = require("node-fetch");
require("dotenv").config({ path: "../.env" });

const token = process.env.CIRCLECI_TOKEN;
const definition_id = process.env.CIRCLECI_DEFINITION_ID;

async function triggerPipeline(promt) {
    const res = await fetch("https://circleci.com/api/v2/project/gh/DeveloperKubilay/hizli-haber/pipeline/run", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify({
            config: { branch: "main" },
            checkout: {
                branch: "main",
            },
            definition_id: definition_id,
            parameters: {
                environment: promt
            }
        }),
    });
    const data = await res.json();

    if (!res.ok) {
        console.error("❌ Trigger failed:", res.status, await res.text());
        return {ok:false};
    }
    data.ok = true;

    return data
}

const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const mainPage = fs.readFileSync('./test.html', 'utf8');

app.use(cors()); // CORS izinleri için bu gerekli
app.use(express.json()); // Body parsing için bu gerekli

app.post('/trigger-pipeline', async (req, res) => {
    const url = req.body.url;
    res.json(await triggerPipeline(url));
});

app.get("/sigma", (req, res) => {
    res.send(mainPage);
});

app.listen(80)