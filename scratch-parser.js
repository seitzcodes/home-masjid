function parseEWKBPoint(hexStr) {
  if (typeof hexStr !== 'string' || !hexStr.startsWith('0101000020E6100000')) return null;
  
  const lonHex = hexStr.substring(18, 34);
  const latHex = hexStr.substring(34, 50);
  
  const getDouble = (hex) => {
    const arr = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      arr[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    const view = new DataView(arr.buffer);
    return view.getFloat64(0, true); // true for little-endian
  };
  
  return { lon: getDouble(lonHex), lat: getDouble(latHex) };
}

console.log(parseEWKBPoint("0101000020E6100000A913D044D8203C40C66D3480B7003AC0"));
