export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );
  
    const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
  
    return { publicKey, privateKey };
  }
  
  export async function signMessage(privateKey, message) {
    const key = await window.crypto.subtle.importKey(
      "jwk",
      privateKey,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
  
    const encoder = new TextEncoder();
    const signature = await window.crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      key,
      encoder.encode(message)
    );
  
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }