import { type FrameRequest } from '@coinbase/onchainkit'
import { getFrameMetadata } from '@coinbase/onchainkit/dist/lib/core/getFrameMetadata'
import { getFrameMessage } from '@coinbase/onchainkit/dist/lib/core/getFrameMessage'
import { Request, Response, renderOpenGraph, route } from './frameSupport'
import {getChatHistorySVG} from "./utils/getImage";
import {getActiveChatters, insertMessage} from "./db/supabase";

const BASE_URL = 'https://frames.phatfn.xyz'
const image = 'https://i.imgur.com/ZMFzt6n.png'

async function GET(req: Request): Promise<Response> {
    if (req.queries?.getChatterBox) {
        return getChatHistorySVG(req);
    } else {
        return getHomeFrame(req);
    }
}

async function getHomeFrame(req: Request): Promise<Response> {
    const secret = req.queries?.key ?? '';
    const frameMetadata = getFrameMetadata({
        buttons: [
            {
                label: 'Enter',
            },
        ],
        image: { src: image, aspectRatio: "1:1" },
        postUrl: BASE_URL + req.path + `?key=${secret[0]}&`,
    });

    return new Response(renderOpenGraph({
            title: BASE_URL + req.path,
            description: 'BRIBE Chatter',
            openGraph: {
                title: BASE_URL + req.path,
                description: 'BRIBE Chatter',
                images: [image],
            },
            other: frameMetadata,
        }),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
    );
}

async function getResponse(req: Request): Promise<Response> {
    const secret = req.queries?.key ?? ''
    const apiKey = req.secret?.apiKey ?? 'NEYNAR_API';
    const supabaseApiKey = req.secret?.supabaseApiKey ?? '';
    const activeChatters = await getActiveChatters(`${supabaseApiKey}`);
    let input = 'BRIBE ME';
    let username = '';
    let imageUrl = BASE_URL + req.path + `?key=${secret[0]}&getChatterBox=${Math.random()}`;

    const body: FrameRequest = await req.json();

    const { isValid, message } = await getFrameMessage(body, { neynarApiKey: `${apiKey}`});

    if (isValid) {
        if (req.queries?.send) {
            const fid = message.interactor.fid;
            input = message.input;
            for (let i = 0; i < activeChatters.length; i++) {
                const chatUser = activeChatters[i];
                if (fid == Number(chatUser.fc_id)) {
                    username = chatUser.username;
                    break;
                }
            }
            if (username !== '') {
                await insertMessage(`${supabaseApiKey}`, username, input);
            } else {
                imageUrl += `&tip=${Math.random()}`;
            }
        }
    } else {
        imageUrl += `&tip=${Math.random()}`;
    }
    const frameMetadata = getFrameMetadata({
        buttons: [
            {
                label: 'Send',
            },
        ],
        input: { text: '/bribe me' },
        image: imageUrl,
        postUrl: BASE_URL + req.path + `?key=${secret[0]}&send=true`,
    });

    return new Response(renderOpenGraph({
            title: BASE_URL + req.path,
            description: 'FrameHub',
            openGraph: {
                title: BASE_URL + req.path,
                description: 'FrameHub',
                images: [image],
            },
            other: frameMetadata,
        }),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
    );
}

async function POST(req: any): Promise<Response> {
    return getResponse(req);
}

export default async function main(request: string) {
    return await route({GET, POST}, request)
}
