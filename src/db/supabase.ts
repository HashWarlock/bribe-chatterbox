export async function insertMessage(supabaseApiKey: string, username: string, text: string) {
  const createdTime = new Date();
  const formatCreatedTime = formatToTime(createdTime.getUTCHours()) + ":" + formatToTime(createdTime.getUTCMinutes()) + ":" + formatToTime(createdTime.getUTCSeconds());
  console.log(formatCreatedTime);
  const options = {
    method: 'POST',
    headers: {
      'apikey': `${supabaseApiKey}`,
      'Authorization': `Bearer ${supabaseApiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: `{"text": "${text}", "created_at": "${formatCreatedTime}", "fc_name": "${username}"}`,
  };

  await fetch(
    'https://xitaptxbvpcnmalzqbjt.supabase.co/rest/v1/ChatterBox',
    options
  );
}

function formatToTime(time: number) {
  return ('0' + time).slice(-2);
}

export async function getChatHistory(supabaseApiKey: unknown) {
  const options = {
    method: 'GET',
    headers: {
      'apikey': `${supabaseApiKey}`,
      'Authorization': `Bearer ${supabaseApiKey}`,
    },
  };
  const chatHistoryResponse = await fetch(
    `https://xitaptxbvpcnmalzqbjt.supabase.co/rest/v1/ChatterBox?limit=16&order=id.desc`,
    options
  );
  // @ts-ignore
  const chatHistoryResponseJson = await chatHistoryResponse.json();
  console.log(chatHistoryResponseJson);
  return chatHistoryResponseJson;
}

export async function getActiveChatters(supabaseApiKey: unknown) {
  const options = {
    method: 'GET',
    headers: {
      'apikey': `${supabaseApiKey}`,
      'Authorization': `Bearer ${supabaseApiKey}`,
    },
  };
  const activeChattersResponse = await fetch(
      `https://xitaptxbvpcnmalzqbjt.supabase.co/rest/v1/Users?active=eq.true`,
      options
  );
  // @ts-ignore
  const activeChattersResponseJson = await activeChattersResponse.json();
  console.log(activeChattersResponseJson);
  return activeChattersResponseJson;
}
