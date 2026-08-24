// Fetching live bundle using global fetch

async function run() {
  const url = 'https://aiproje.vercel.app';
  console.log(`Fetching HTML from ${url}...`);
  const htmlRes = await fetch(url);
  const html = await htmlRes.text();
  
  // Find script tag with src starting with /assets/index-
  const match = html.match(/src="([^"]+\.js)"/);
  if (!match) {
    console.log("Could not find script tag in HTML:", html);
    return;
  }
  
  const jsUrl = url + match[1];
  console.log(`Fetching JS bundle from ${jsUrl}...`);
  const jsRes = await fetch(jsUrl);
  const js = await jsRes.text();
  
  // Look for getCurriculum or orderBy
  const hasOrderBy = js.includes('orderBy("week"');
  const hasGetCurriculum = js.includes('getCurriculum');
  
  console.log(`Contains 'orderBy("week"': ${hasOrderBy}`);
  console.log(`Contains 'getCurriculum': ${hasGetCurriculum}`);
  
  // Print around getCurriculum matches
  const index = js.indexOf('curriculum');
  if (index !== -1) {
    console.log("Snippet around 'curriculum':");
    console.log(js.substring(index - 100, index + 300));
  } else {
    console.log("Could not find 'curriculum' in JS bundle.");
  }
}

run().catch(console.error);
