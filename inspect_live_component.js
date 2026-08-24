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
  
  // Search for "Müfredat Yönetimi"
  const textIndex = js.indexOf('M\xFCfredat Y\xF6netimi');
  const textIndex2 = js.indexOf('Müfredat Yönetimi');
  const index = textIndex !== -1 ? textIndex : textIndex2;
  
  if (index !== -1) {
    console.log("Found Müfredat Yönetimi in bundle!");
    console.log("Snippet:");
    console.log(js.substring(index - 500, index + 1000));
  } else {
    console.log("Could not find Müfredat Yönetimi in bundle. Searching for 'selectedGrade'...");
    const sgIndex = js.indexOf('selectedGrade');
    if (sgIndex !== -1) {
      console.log("Snippet around selectedGrade:");
      console.log(js.substring(sgIndex - 200, sgIndex + 400));
    } else {
      console.log("Could not find selectedGrade either.");
    }
  }
}

run().catch(console.error);
