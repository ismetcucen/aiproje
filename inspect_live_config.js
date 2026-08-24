// Using global fetch


async function run() {
  const url = 'https://aiproje.vercel.app';
  const htmlRes = await fetch(url);
  const html = await htmlRes.text();
  const match = html.match(/src="([^"]+\.js)"/);
  if (!match) return console.log("Script not found");
  
  const jsUrl = url + match[1];
  console.log(`Downloading JS from ${jsUrl}...`);
  const jsRes = await fetch(jsUrl);
  const js = await jsRes.text();
  
  // Search for apiKey in the JS code
  const apiKeyIndex = js.indexOf('apiKey:');
  if (apiKeyIndex !== -1) {
    console.log("Found apiKey: in bundle!");
    console.log("Snippet:", js.substring(apiKeyIndex, apiKeyIndex + 400));
  } else {
    // Let's search for "aiproje-e8ce2"
    const projIndex = js.indexOf('aiproje-e8ce2');
    if (projIndex !== -1) {
      console.log("Found project ID in bundle!");
      console.log("Snippet:", js.substring(projIndex - 100, projIndex + 200));
    } else {
      console.log("Could not find apiKey or project ID in bundle.");
    }
  }
}

run().catch(console.error);
