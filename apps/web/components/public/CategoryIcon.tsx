export function CategoryIcon({ icon, size = 28 }: { icon: string; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (icon) {
    case "pizza":
      return <svg {...props}><path d="M15 11h.01M11 15h.01M16 16h.01" /><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" /></svg>;
    case "cake":
      return <svg {...props}><path d="M2 12h20" /><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /><path d="m4 8 16-4" /></svg>;
    case "salad":
      return <svg {...props}><path d="M12 2a10 10 0 0 1 10 10 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2A10 10 0 0 1 12 2Z" /><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>;
    case "soup":
      return <svg {...props}><path d="M12 2v4" /><path d="M8 4v2" /><path d="M16 4v2" /><path d="M2 10h20v2a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8v-2z" /></svg>;
    case "drink":
      return <svg {...props}><path d="M8 2h8l4 10H4L8 2Z" /><path d="M12 12v6" /><path d="M6 18h12" /></svg>;
    case "cookie":
      return <svg {...props}><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" /></svg>;
    case "fish":
      return <svg {...props}><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" /><path d="M2 12S4 8 6.5 12 2 16 2 12" /><circle cx="14.5" cy="12" r="1" /></svg>;
    case "meat":
      return <svg {...props}><path d="M15.5 2.5c2 2 2 5.5 0 7.5L8 17.5c-2 2-5.5 2-7.5 0 2-2 2-5.5 0-7.5L8 2.5c2-2 5.5-2 7.5 0Z" /><path d="m10.5 6.5 3 3" /></svg>;
    case "bread":
      return <svg {...props}><path d="M21 12c0-4.4-3.6-8-8-8H7C4.2 4 2 6.2 2 9c0 1.4.6 2.6 1.5 3.5-.3.6-.5 1.3-.5 2 0 2.8 2.2 5 5 5h5c4.4 0 8-3.6 8-8Z" /></svg>;
    case "egg":
      return <svg {...props}><path d="M12 22c4.4 0 8-4.5 8-10S16.4 2 12 2 4 6.5 4 12s3.6 10 8 10Z" /></svg>;
    case "flame":
      return <svg {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>;
    default:
      return <svg {...props}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>;
  }
}
