var fetch = require("node-fetch");
require("dotenv").config();

const token = process.env.CIRCLECI_TOKEN;
const definition_id = process.env.CIRCLECI_DEFINITION_ID;
const promt = "Bu url bakarmısın https://www.epey.com/akilli-telefonlar/samsung-galaxy-s25.html"

async function triggerPipeline() {
    const res = await fetch("https://circleci.com/api/v2/project/gh/DeveloperKubilay/hizli-haber/pipeline/run", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify({
            config:{branch: "main"},
            checkout: {
                branch: "main",
            },
            definition_id: definition_id,
            parameters: {
                environment: promt
            }
        }),
    });

    if (!res.ok) {
        console.error("❌ Trigger failed:", res.status, await res.text());
        return;
    }

    const data = await res.json();
    console.log("✅ Pipeline triggered:", data);
}

triggerPipeline();