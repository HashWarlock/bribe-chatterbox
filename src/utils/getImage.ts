import {Request, Response} from "../frameSupport";
import {getActiveChatters, getChatHistory} from "../db/supabase";

function getTipTag(req: Request) {
  const outlineColor = '#A56537';
  const historyFontColor = '#A56537';
  const whiteFontColor = '#ffffff';
  const tipBoxBgColor = '#000000';

  return `<g id="tip">
      <path id="Path-copy" fill="${tipBoxBgColor}" stroke="${outlineColor}" stroke-width="5" d="M 50 200 L 1150 200 L 1150 600 L 50 600 Z"/>
      <path id="path2" fill="${tipBoxBgColor}" stroke="${outlineColor}" stroke-width="5" d="M 70 280 L 1130 280 L 1130 580 L 70 580 Z"/>
      <text id="Tip" x="520" y="250" font-family="Courier" font-size="36" font-weight="700" fill="${historyFontColor}">📝Tip</text>    
      <text id="Must-Bribe"><tspan x="100" y="350" font-family="Courier" font-size="36" font-weight="700" fill="${historyFontColor}">Must <tspan fill="${whiteFontColor}" text-decoration="underline">BRIBE</tspan> to execute action.</tspan></text>
      <text id="Y" x="100" y="420" font-family="Courier" font-size="36" font-weight="700" fill="${historyFontColor}">🥸️Y</text>
      <text id="No" x="100" y="480" font-family="Courier" font-size="36" font-weight="700" fill="${historyFontColor}">☠️NO</text>
      <text id="BRIBE?" x="100" y="540" font-family="Courier" font-size="36" font-weight="700" fill="${historyFontColor}" >🫴 BR<tspan font-size="40">I</tspan>BE</text>
    </g>`;
}

function getChatterColors(activeChatters: any) {
  let result: Record<string, string> = {};
  for (let i = 0; i < activeChatters.length; i++) {
    const chatterInfo = activeChatters[i];
    result[chatterInfo.username] = chatterInfo.color;
  }
  console.log(result);
  return result;
}

export async function getChatHistorySVG(req: Request): Promise<Response> {
  const supabaseApiKey = req.secret?.supabaseApiKey ?? '';
  const lastChatMessages = await getChatHistory(`${supabaseApiKey}`);
  const activeChatters = await getActiveChatters(`${supabaseApiKey}`);
  const chattersColors = getChatterColors(activeChatters);
  const tip = req.queries?.tip;

  const titleColor = '#ffffff';
  const bgColor = '#A56537';
  const historyFontColor = '#A56537';
  const historyXCoordinate = 20;
  const historyYCoordinate = 145;
  const yCoordinateIncrement = 30;

  const closingHistoryTag = `\t\t</text>\n\t</g>`;
  const closingSvgTag = `</svg>`;
  let svg = `
  <svg width="1200" height="632" viewBox="0 0 1200 632" xmlns="http://www.w3.org/2000/svg" >
    <path id="Path" fill="${bgColor}" stroke="none" d="M 15 0 L 1185 0 C 1193.284302 0 1200 6.715698 1200 15 L 1200 616.578979 C 1200 624.863281 1193.284302 631.578979 1185 631.578979 L 15 631.578979 C 6.715729 631.578979 0 624.863281 0 616.578979 L 0 15 C -0 6.715698 6.715729 0 15 0 Z"/>
    <text id="title" font-family="Helvetica" text-anchor="middle" font-size="54" font-weight="700" fill="${titleColor}" x="50%" y="13%">BR<tspan font-size="64">I</tspan>BE Chatter</text>
    <text id="title" font-family="Helvetica" text-anchor="middle" font-size="54" font-weight="700" fill="${titleColor}" x="50%" y="50%">BR<tspan font-size="64">I</tspan>BE</text>
    <g id="history">
        <rect width="1200" height="512" y="120" fill="rgba(0,0,0,0.8)" />
        <text font-family="monospace" font-size="24" font-weight="700" fill="${historyFontColor}">\n`;
  let latestYCoordinateMultiplier = 1;
  for (let i = lastChatMessages.length - 1; i >= 0; i--) {
    const chatMessage = lastChatMessages[i];
    const username = chatMessage.fc_name;
    const text = chatMessage.text;
    const guessTime = chatMessage.created_at.slice(0,5);
    const color = chattersColors[username];
    svg += `\t\t<tspan x="${historyXCoordinate}" y="${(latestYCoordinateMultiplier * yCoordinateIncrement) + historyYCoordinate}">${guessTime}</tspan> <tspan fill="${color}"> @${username}</tspan><tspan> ${text}</tspan>\n`
    latestYCoordinateMultiplier++;
  }
  svg += closingHistoryTag;
  if (tip) {
    svg += getTipTag(req);
  }

  svg += closingSvgTag;
  console.log(svg);
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml;' } });
}
