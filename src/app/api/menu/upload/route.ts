import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getStorageEnv } from '@/lib/env';

const BUCKET_NAME = 'flamingo-cafe';

let cachedClient: S3Client | null = null;
const storageEnv = getStorageEnv();

function getS3Client() {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: storageEnv.REGION,
      endpoint: storageEnv.ENDPOINT_URL,
      credentials: {
        accessKeyId: storageEnv.ACCESS_KEY_ID,
        secretAccessKey: storageEnv.SECRET_ACCESS_KEY,
      },
      // Supabase's S3-compatible endpoint requires path-style URLs; otherwise the
      // bucket name becomes part of the hostname and TLS handshakes fail.
      forcePathStyle: true,
    });
  }

  return cachedClient;
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json(
      { error: 'You are not authorized to perform this action.' },
      { status: 403 }
    );
  }

  return session;
}

function buildObjectKey(filename: string) {
  const trimmed = filename.trim().toLowerCase();
  const lastDotIndex = trimmed.lastIndexOf('.');
  const extension = lastDotIndex > -1 ? trimmed.slice(lastDotIndex) : '';
  const baseName =
    (lastDotIndex > 0 ? trimmed.slice(0, lastDotIndex) : trimmed)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '') || 'image';

  const datePrefix = new Date().toISOString().split('T')[0];

  return `menu/${datePrefix}/${randomUUID()}-${baseName}${extension}`;
}

function getPublicUrl(key: string) {
  const endpoint = storageEnv.ENDPOINT_URL;
  const endpointUrl = new URL(endpoint);

  const publicHost = endpointUrl.hostname.replace('.storage.', '.');
  const publicUrl = new URL(endpointUrl.toString());
  publicUrl.hostname = publicHost;
  publicUrl.pathname = publicUrl.pathname.replace(/\/s3\/?$/, '/object/public');

  const pathname = publicUrl.pathname.endsWith('/')
    ? publicUrl.pathname.slice(0, -1)
    : publicUrl.pathname;

  return `${publicUrl.origin}${pathname}/${BUCKET_NAME}/${key}`;
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = buildObjectKey(file.name || 'image.jpg');

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
      })
    );

    return NextResponse.json({
      key,
      url: getPublicUrl(key),
    });
  } catch (error) {
    console.error('Failed to upload menu image', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json().catch(() => undefined);
  const key = typeof body?.key === 'string' ? body.key : undefined;

  if (!key) {
    return NextResponse.json(
      { error: 'Object key is required.' },
      { status: 400 }
    );
  }

  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete menu image', error);
    return NextResponse.json(
      { error: 'Failed to delete image. Please try again.' },
      { status: 500 }
    );
  }
}
