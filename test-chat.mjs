

async function test() {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({messages: [{role: 'user', content: 'Anak saya umurnya 10 tahun, dia susah makan akhir-akhir ini'}]})
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}
test().catch(console.error);
