const https = require('https');

https.get('https://padlet.com/api/10/wishes?wall_hashid=board_dbVkA4Rgm7r8vlq3', (resp) => {
  let data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    const posts = json.data || [];
    posts.forEach(post => {
      console.log(post.attributes.body);
    });
  });
});
