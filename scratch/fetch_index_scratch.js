import http from 'http';

http.get('http://localhost:5174/repaper-route/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('--- RESPONSE START ---');
    console.log(data);
    console.log('--- RESPONSE END ---');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
