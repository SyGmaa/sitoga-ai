async function main() {
  const url = "http://localhost:3000/api/diagnosa-v3";
  const payload = {
    messages: [
      {
        id: "system-v3",
        role: "assistant",
        content: "Ceritakan keluhan medis Anda, saya akan menelusuri hubungan Gejala dan Penyakit langsung dari database tanaman herbal kebun raya Universitas Pahlawan."
      },
      {
        id: "user-1",
        role: "user",
        content: "suhu diatas normal, menggigil, berkeringat, kemas, neri otot, pala juga sakit"
      }
    ],
    provider: "google",
    model: "gemini-2.5-flash"
  };

  console.log("Sending POST to local API...");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error(text);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      console.log("No body reader");
      return;
    }

    const decoder = new TextDecoder();
    let done = false;
    let text = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        text += decoder.decode(value, { stream: !done });
      }
    }

    console.log("Response body length:", text.length);
    console.log("Raw response (sample):", text.slice(0, 1000));
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

main();
