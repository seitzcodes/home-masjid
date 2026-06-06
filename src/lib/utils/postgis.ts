export function parsePostGisPoint(pointStr: string | any): { lat: number, lng: number } | null {
  if (!pointStr) return null;
  
  if (typeof pointStr === 'string') {
    // If it's Well-Known Binary (Hex), e.g., 0101000020E6100000...
    if (pointStr.startsWith('0101000020') || pointStr.startsWith('0101000000')) {
      const offset = pointStr.startsWith('0101000020') ? 18 : 10;
      
      const hexToFloat64 = (hex: string) => {
        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        const matches = hex.match(/.{2}/g);
        if (matches) {
          matches.forEach((byte, i) => view.setUint8(i, parseInt(byte, 16)));
        }
        return view.getFloat64(0, true); // true for little-endian
      };
      
      const lngHex = pointStr.substring(offset, offset + 16);
      const latHex = pointStr.substring(offset + 16, offset + 32);
      
      return { 
        lng: hexToFloat64(lngHex), 
        lat: hexToFloat64(latHex) 
      };
    }
    
    // Fallback for WKT (Well-Known Text)
    const match = pointStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
      return { 
        lng: parseFloat(match[1]), 
        lat: parseFloat(match[2]) 
      };
    }
  } else if (pointStr.coordinates) {
    // GeoJSON
    return { 
      lng: pointStr.coordinates[0], 
      lat: pointStr.coordinates[1] 
    };
  }
  
  return null;
}
