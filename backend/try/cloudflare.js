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

const model = "@cf/lykon/dreamshaper-8-lcm";

run(model, {
    prompt: "SON DAKİKA! İsrail'e 'NAH!' Dediler! 🤯 Bölgede Tansiyon YÜKSELİYOR! Ne Oluyor Orada?!"
}).then((response) => {
    console.log("Response: Image saved as output.png");
    require("fs").writeFileSync("output.png", response);
});

run(model, {
    prompt: "BREAKING NEWS! They said 'NAH!' to Israel! 🤯 Tension is RISING in the region! What's Happening There?!"
}).then((response) => {
    console.log("Response: Image saved as output.png");
    require("fs").writeFileSync("output2.png", response);
});