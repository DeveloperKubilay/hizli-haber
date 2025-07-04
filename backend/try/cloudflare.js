require("dotenv").config({ path: "../.env" });

async function run(model, input) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/a05057577967c7503e88f8229c93d296/ai/run/${model}`,
    {
      headers: { Authorization: "Bearer " + process.env.CLOUDFLARE_API_KEY },
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  const result = await response.arrayBuffer();
  return Buffer.from(result);
}

const model = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

run(model, {
  prompt: "🤯📱 Samsung Yine Şaşırttı! Galaxy S26 Ultra'da BÜYÜK Hayal Kırıklığı mı Var? 😱🔋📸"
}).then((response) => {
  console.log("Response: Image saved as output.png");
  require("fs").writeFileSync("output.png", response);
});

