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
  
  // Search for firebaseapp.com
  const fbAppIndex = js.indexOf('firebaseapp.com');
  if (fbAppIndex !== -1) {
    console.log("Found firebaseapp.com!");
    console.log("Snippet:", js.substring(fbAppIndex - 100, fbAppIndex + 100));
  } else {
    console.log("Could not find firebaseapp.com");
  }
  
  // Search for AIzaSy
  const keyIndex = js.indexOf('AIzaSy');
  if (keyIndex !== -1) {
    console.log("Found API key prefix AIzaSy!");
    console.log("Snippet:", js.substring(keyIndex - 10, keyIndex + 50));
  } else {
    console.log("Could not find API key prefix AIzaSy");
  }
}

run().catch(console.error);
