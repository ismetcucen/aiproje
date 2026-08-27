const https = require('https');

https.get('https://padlet.com/api/10/wishes?wall_hashid=board_dbVkA4Rgm7r8vlq3', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    const json = JSON.parse(data);
    const posts = json.data || [];
    
    console.log("Padlet'teki Linkler ve Araçlar:");
    posts.forEach(post => {
      const p = post.attributes;
      const title = p.headline || '';
      const body = p.body || '';
      
      let link = '';
      if (p.attachment_link && p.attachment_link.url) {
        link = p.attachment_link.url;
      }
      
      // Look for hrefs in body
      const hrefMatch = body.match(/href="([^"]*)"/);
      if (hrefMatch) {
         link = hrefMatch[1];
      }
      
      console.log(`- Başlık: ${title}`);
      if (link) console.log(`  Link: ${link}`);
    });
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
